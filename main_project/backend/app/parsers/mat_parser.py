import math
from pathlib import Path
import re
import struct
from typing import Any, Dict, List, Optional, Set, Tuple
import h5py
import numpy as np
import scipy.io as sio

from app.config import MODEL_CHANNEL_NAMES, REQUIRED_CHANNELS, TARGET_FS
from app.parsers.base import EEGRecording
from app.preprocessing.channels import detect_and_orient_time_dimension
from app.utils.logging import log_pipeline_step


METADATA_VAR_KEYWORDS = {
    "sequence", "order", "index", "indices", "trigger", "triggers",
    "marker", "markers", "event", "events", "condition", "conditions",
    "label", "labels", "subject", "sub", "id", "session", "trial_idx"
}


def convert_3d_to_2d_eeg(arr: np.ndarray) -> np.ndarray:
    """
    Convert a 3D EEG tensor (trials x time x channels, channels x time x trials, etc.)
    into a continuous (time, channels) 2D signal array.
    """
    if not isinstance(arr, np.ndarray) or arr.ndim != 3:
        return arr

    a, b, c = arr.shape
    common_channels = [REQUIRED_CHANNELS, 14, 16, 18, 21, 24, 32, 64, 128, 256, 8, 4]

    channel_axis = None
    if c == REQUIRED_CHANNELS:
        channel_axis = 2
    elif a == REQUIRED_CHANNELS:
        channel_axis = 0
    elif b == REQUIRED_CHANNELS:
        channel_axis = 1
    else:
        for ch in common_channels:
            if c == ch:
                channel_axis = 2
                break
            elif a == ch:
                channel_axis = 0
                break
            elif b == ch:
                channel_axis = 1
                break

    if channel_axis is None:
        dims = [(a, 0), (b, 1), (c, 2)]
        dims_sorted = sorted(dims, key=lambda x: x[0])
        channel_axis = dims_sorted[0][1]

    if channel_axis == 2:
        return arr.reshape(-1, c)
    elif channel_axis == 0:
        return arr.transpose(1, 2, 0).reshape(-1, a)
    else:
        return arr.transpose(0, 2, 1).reshape(-1, b)


def is_signal_candidate(arr: np.ndarray) -> bool:
    """Check if array looks like candidate EEG signal data (1D, 2D or 3D)."""
    if not isinstance(arr, np.ndarray):
        return False
    if not np.issubdtype(arr.dtype, np.number):
        return False
    if arr.ndim == 1:
        return arr.size >= 16
    if arr.ndim == 2:
        r, c = arr.shape
        return min(r, c) >= 1 and max(r, c) >= 16
    if arr.ndim == 3:
        return any(d >= 16 for d in arr.shape)
    return False


def extract_numeric_arrays_recursively(
    obj: Any,
    prefix: str = "root",
    visited: Optional[Set[int]] = None
) -> List[Tuple[str, np.ndarray]]:
    """
    Recursively search MATLAB structures for candidate numeric arrays.
    Handles:
      - Plain numeric 1D, 2D and 3D ndarrays
      - Object ndarrays and cell arrays (e.g. Mendeley FC/MC/MADHD/FADHD subject cells)
      - MATLAB structs (scipy mat_struct)
      - Dictionaries
      - Lists / tuples
    """
    if visited is None:
        visited = set()

    obj_id = id(obj)
    if obj_id in visited:
        return []
    visited.add(obj_id)

    candidates: List[Tuple[str, np.ndarray]] = []

    # 1. Plain numeric or object ndarray
    if isinstance(obj, np.ndarray):
        # 1a. Numeric array
        if np.issubdtype(obj.dtype, np.number):
            if obj.ndim == 3:
                arr_2d = convert_3d_to_2d_eeg(obj)
                if is_signal_candidate(arr_2d):
                    candidates.append((prefix, np.asarray(arr_2d, dtype=np.float64)))
                return candidates
            if obj.ndim == 1:
                arr_2d = obj.reshape(-1, 1)
                if is_signal_candidate(arr_2d):
                    candidates.append((prefix, np.asarray(arr_2d, dtype=np.float64)))
                return candidates
            if is_signal_candidate(obj):
                candidates.append((prefix, np.asarray(obj, dtype=np.float64)))
            return candidates

        # 1b. Object ndarray / cell array (Mendeley subject groups or trial collections)
        if obj.dtype == object:
            numeric_items = []
            for idx, item in np.ndenumerate(obj):
                if isinstance(item, np.ndarray) and np.issubdtype(item.dtype, np.number):
                    if item.ndim == 3:
                        c2d = convert_3d_to_2d_eeg(item)
                        if is_signal_candidate(c2d):
                            numeric_items.append(c2d)
                    elif item.ndim == 2 and is_signal_candidate(item):
                        numeric_items.append(item)
                elif hasattr(item, "_fieldnames"):
                    for f in ["data", "signal", "eeg", "val", "x"]:
                        if hasattr(item, f):
                            fval = getattr(item, f)
                            if isinstance(fval, np.ndarray) and np.issubdtype(fval.dtype, np.number):
                                if fval.ndim == 3:
                                    c2d = convert_3d_to_2d_eeg(fval)
                                    if is_signal_candidate(c2d):
                                        numeric_items.append(c2d)
                                elif fval.ndim == 2 and is_signal_candidate(fval):
                                    numeric_items.append(fval)
                                break

            if numeric_items:
                try:
                    # Orient all arrays so columns are channels
                    oriented_items = []
                    for c in numeric_items:
                        if c.shape[0] < c.shape[1] and c.shape[0] <= 128:
                            oriented_items.append(c.T)
                        else:
                            oriented_items.append(c)

                    # Determine channel counts across candidate arrays
                    ch_counts = [c.shape[1] for c in oriented_items]
                    # Select dominant channel count, prioritizing full montages (channels >= 4)
                    valid_counts = [ch for ch in ch_counts if ch >= 4]
                    dominant_ch = max(valid_counts) if valid_counts else max(ch_counts)

                    aligned = [c[:, :dominant_ch] for c in oriented_items if c.shape[1] >= dominant_ch]
                    if aligned:
                        concat = np.concatenate(aligned, axis=0)
                        candidates.append((f"{prefix}_all", np.asarray(concat, dtype=np.float64)))
                except Exception:
                    pass


            # Also recursively inspect individual elements
            for idx, item in np.ndenumerate(obj):
                sub_prefix = f"{prefix}[{','.join(map(str, idx))}]"
                candidates.extend(extract_numeric_arrays_recursively(item, sub_prefix, visited))
            return candidates

        # 1c. Structured ndarray with field names
        if obj.dtype.names:
            for name in obj.dtype.names:
                try:
                    candidates.extend(
                        extract_numeric_arrays_recursively(obj[name], f"{prefix}.{name}", visited)
                    )
                except Exception:
                    pass
            return candidates

    # 2. Dictionary
    if isinstance(obj, dict):
        for k, v in obj.items():
            if str(k).startswith("__"):
                continue
            candidates.extend(extract_numeric_arrays_recursively(v, f"{prefix}.{k}", visited))
        return candidates

    # 3. scipy.io mat_struct
    if hasattr(obj, "_fieldnames"):
        for field in obj._fieldnames:
            try:
                val = getattr(obj, field)
                candidates.extend(extract_numeric_arrays_recursively(val, f"{prefix}.{field}", visited))
            except Exception:
                pass
        return candidates

    # 4. List / Tuple
    if isinstance(obj, (list, tuple)):
        for i, item in enumerate(obj):
            candidates.extend(extract_numeric_arrays_recursively(item, f"{prefix}[{i}]", visited))

    return candidates


def score_candidate(name: str, arr: np.ndarray) -> float:
    """Score candidate array based on shape, dimensions, and variable name."""
    if arr.ndim == 1:
        r, c = arr.shape[0], 1
    else:
        r, c = arr.shape
    score = math.log1p(arr.size)

    ch_count = min(r, c)
    samples_count = max(r, c)

    # Channel count scoring: prioritize full montage EEG arrays
    if ch_count == REQUIRED_CHANNELS:  # 19 channels
        score += 50.0
    elif ch_count in {14, 16, 18, 21, 24, 32, 64, 128}:
        score += 35.0
    elif ch_count >= 4:
        score += 25.0
    elif ch_count == 3:
        score += 10.0
    elif ch_count == 2:
        score -= 25.0  # Heavy penalty for 2 channels when higher channel candidates exist
    else:
        score -= 50.0  # 1D vector penalty

    # Sample count bonus
    if samples_count >= 1280:
        score += 30.0
    elif samples_count >= 256:
        score += 15.0

    # Keyword bonuses / penalties: prioritize true signals over trial sequence/event metadata
    lower_name = name.lower()
    is_meta = any(kw in lower_name for kw in METADATA_VAR_KEYWORDS)
    if is_meta:
        score -= 40.0
    else:
        for kw in ["eeg", "data", "signal", "raw", "val", "x"]:
            if kw in lower_name:
                score += 10.0

    # Slight bonus for aggregated collections
    if "_all" in lower_name:
        score += 10.0

    return score



def select_best_eeg_array(candidates: List[Tuple[str, np.ndarray]]) -> Tuple[np.ndarray, str]:
    """Select the best candidate EEG array from the list of extracted candidates."""
    if not candidates:
        raise ValueError("No numeric EEG array could be located inside the MATLAB file.")

    scored = []
    for name, arr in candidates:
        if is_signal_candidate(arr):
            s = score_candidate(name, arr)
            scored.append((s, name, arr))

    if not scored:
        raise ValueError(
            "The MATLAB file contains numeric data, but none resembles a valid EEG signal."
        )

    scored.sort(key=lambda item: item[0], reverse=True)
    best_score, best_name, best_arr = scored[0]
    return best_arr, best_name


def find_mat_sampling_rate(obj: Any, visited: Optional[Set[int]] = None) -> Optional[float]:
    """Recursively search for sampling rate metadata in MATLAB object."""
    if visited is None:
        visited = set()

    obj_id = id(obj)
    if obj_id in visited:
        return None
    visited.add(obj_id)

    preferred_keys = ["fs", "Fs", "FS", "sampling_rate", "sample_rate", "srate", "sfreq", "frequency"]

    # Check dict
    if isinstance(obj, dict):
        for k in preferred_keys:
            if k in obj:
                try:
                    val = np.asarray(obj[k]).squeeze()
                    if val.size == 1:
                        fs = float(val)
                        if 1.0 <= fs <= 10000.0:
                            return fs
                except Exception:
                    pass

        for k, v in obj.items():
            if str(k).startswith("__"):
                continue
            res = find_mat_sampling_rate(v, visited)
            if res is not None:
                return res

    # Check mat_struct
    if hasattr(obj, "_fieldnames"):
        for f in obj._fieldnames:
            if str(f).lower() in {"fs", "sampling_rate", "sample_rate", "srate", "sfreq"}:
                try:
                    val = np.asarray(getattr(obj, f)).squeeze()
                    if val.size == 1:
                        fs = float(val)
                        if 1.0 <= fs <= 10000.0:
                            return fs
                except Exception:
                    pass

    # Check ndarray (object array or structured array)
    if isinstance(obj, np.ndarray):
        if obj.dtype.names:
            for f in obj.dtype.names:
                try:
                    res = find_mat_sampling_rate(obj[f], visited)
                    if res is not None:
                        return res
                except Exception:
                    pass
        if obj.dtype == object or obj.dtype.kind in {"V", "O"}:
            for item in obj.flat:
                res = find_mat_sampling_rate(item, visited)
                if res is not None:
                    return res

    return None


def estimate_sampling_rate_from_signal(signal_1d: np.ndarray) -> Optional[float]:
    """
    Estimate native EEG sampling rate by detecting 50 Hz or 60 Hz mains powerline hum.
    Tests standard EEG sampling rates: [256.0, 250.0, 500.0, 512.0, 128.0].
    """
    if not isinstance(signal_1d, np.ndarray) or len(signal_1d) < 512:
        return None
    x = signal_1d[:min(len(signal_1d), 8192)].astype(np.float64)
    x = x - np.mean(x)
    if np.all(x == 0):
        return None

    candidates_fs = [256.0, 250.0, 500.0, 512.0, 128.0]
    best_fs = None
    best_ratio = 2.5

    for test_fs in candidates_fs:
        fft_vals = np.abs(np.fft.rfft(x))
        freqs = np.fft.rfftfreq(len(x), d=1.0 / test_fs)
        for target_hz in [50.0, 60.0]:
            if target_hz > test_fs / 2.0:
                continue
            peak_mask = (freqs >= target_hz - 0.75) & (freqs <= target_hz + 0.75)
            noise_mask = (freqs >= target_hz - 4.0) & (freqs <= target_hz + 4.0) & ~peak_mask
            if peak_mask.sum() > 0 and noise_mask.sum() > 0:
                peak_power = float(np.max(fft_vals[peak_mask]))
                noise_floor = float(np.median(fft_vals[noise_mask])) + 1e-12
                ratio = peak_power / noise_floor
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_fs = test_fs

    return best_fs


def is_valid_channel_list(names: List[str]) -> bool:

    """Check if a list of strings represents a plausible list of EEG channel labels."""
    if not names or len(names) < 2 or len(names) > 512:
        return False
    for n in names:
        if not isinstance(n, str) or not (1 <= len(n) <= 16):
            return False
    from app.preprocessing.channels import ALIAS_LOOKUP, clean_channel_name
    match_count = sum(1 for n in names if clean_channel_name(n) in ALIAS_LOOKUP)
    return match_count >= 2 or (match_count / len(names)) >= 0.15


def find_mat_channel_names(obj: Any, visited: Optional[Set[int]] = None) -> Optional[List[str]]:
    """Search MATLAB structure for channel labels."""
    if visited is None:
        visited = set()

    obj_id = id(obj)
    if obj_id in visited:
        return None
    visited.add(obj_id)

    keys = [
        "channels", "clab", "labels", "chanlocs", "channel_names", "ch_names",
        "chan", "chans", "electrode", "electrodes", "montage"
    ]

    if isinstance(obj, dict):
        for k in keys:
            if k in obj:
                try:
                    val = obj[k]
                    names = find_mat_channel_names(val, visited)
                    if names and len(names) >= 2:
                        return names
                except Exception:
                    pass

        for k, v in obj.items():
            if str(k).startswith("__"):
                continue
            res = find_mat_channel_names(v, visited)
            if res is not None:
                return res

    if hasattr(obj, "_fieldnames"):
        for f in obj._fieldnames:
            if str(f).lower() in {"channels", "clab", "labels", "chanlocs", "ch_names", "chan", "electrode"}:
                try:
                    val = getattr(obj, f)
                    names = find_mat_channel_names(val, visited)
                    if names and len(names) >= 2:
                        return names
                except Exception:
                    pass

        for f in obj._fieldnames:
            res = find_mat_channel_names(getattr(obj, f), visited)
            if res is not None:
                return res

    # Check ndarray (object array, struct array, or string array)
    if isinstance(obj, np.ndarray):
        # Case A: Object or structured array containing structs (e.g. EEGLAB chanlocs array)
        if obj.dtype == object or obj.dtype.kind in {"V", "O"}:
            collected_labels: List[str] = []
            for item in obj.flat:
                if hasattr(item, "_fieldnames"):
                    for lbl_field in ["labels", "label", "name", "channel", "chan"]:
                        if lbl_field in item._fieldnames:
                            val = getattr(item, lbl_field)
                            s = str(np.asarray(val).squeeze()).strip()
                            if s:
                                collected_labels.append(s)
                            break
            if len(collected_labels) >= 2:
                return collected_labels

            # Case B: Object array where each element is a string or char array (cell array of strings)
            str_items: List[str] = []
            for item in obj.flat:
                if isinstance(item, (str, np.str_)):
                    s = str(item).strip()
                    if 1 <= len(s) <= 16:
                        str_items.append(s)
                elif isinstance(item, np.ndarray):
                    if item.dtype.kind in {"U", "S"}:
                        s = "".join(str(c) for c in item.ravel()).strip()
                        if 1 <= len(s) <= 16:
                            str_items.append(s)
                    elif np.issubdtype(item.dtype, np.integer) and item.size <= 16:
                        s = "".join(chr(int(c)) for c in item.ravel() if c != 0).strip()
                        if 1 <= len(s) <= 16:
                            str_items.append(s)
            if len(str_items) >= 2 and len(str_items) == obj.size:
                return str_items

        # Case C: 2D char matrix (e.g. ['Fp1 '; 'Fp2 '])
        if obj.dtype.kind in {"U", "S"}:
            if obj.ndim == 2:
                names = ["".join(str(c) for c in row).strip() for row in obj]
                names = [n for n in names if n]
                if len(names) >= 2:
                    return names
            elif obj.ndim == 1:
                names = [str(x).strip() for x in obj if str(x).strip()]
                if len(names) >= 2:
                    return names

        if obj.dtype.names:
            for f in obj.dtype.names:
                if str(f).lower() in {"channels", "clab", "labels", "chanlocs", "ch_names", "chan"}:
                    try:
                        val = obj[f]
                        names = find_mat_channel_names(val, visited)
                        if names and len(names) >= 2:
                            return names
                    except Exception:
                        pass
            for f in obj.dtype.names:
                try:
                    res = find_mat_channel_names(obj[f], visited)
                    if res is not None:
                        return res
                except Exception:
                    pass

    return None


def read_h5_ref_string(f: h5py.File, ref: Any) -> Optional[str]:
    """Safely dereference an HDF5 object reference and decode string."""
    try:
        target = f[ref]
        if isinstance(target, h5py.Dataset):
            data = target[()]
            if np.issubdtype(data.dtype, np.integer):
                chars = "".join(chr(int(c)) for c in data.ravel() if c != 0).strip()
                if chars:
                    return chars
            elif data.dtype.kind in {"S", "U"}:
                return str(data.ravel()[0]).strip()
            elif isinstance(data, (bytes, bytearray)):
                return data.decode("utf-8", errors="ignore").strip()
    except Exception:
        pass
    return None


def extract_strings_from_hdf5_dataset(f: h5py.File, ds: h5py.Dataset) -> List[str]:
    """Extract list of channel name strings from an HDF5 dataset."""
    names: List[str] = []
    try:
        if ds.dtype == h5py.ref_dtype or ds.dtype.kind == "O":
            for ref in ds[()].flat:
                s = read_h5_ref_string(f, ref)
                if s and 1 <= len(s) <= 16:
                    names.append(s)
        elif ds.dtype.kind in {"S", "U"}:
            for item in ds[()].flat:
                s = str(item).strip()
                if 1 <= len(s) <= 16:
                    names.append(s)
        elif np.issubdtype(ds.dtype, np.integer) and ds.ndim == 2:
            r, c = ds.shape
            if c <= 16 and r >= 2:
                for row in ds[()]:
                    s = "".join(chr(int(x)) for x in row if x != 0).strip()
                    if s:
                        names.append(s)
            elif r <= 16 and c >= 2:
                for col in ds[()].T:
                    s = "".join(chr(int(x)) for x in col if x != 0).strip()
                    if s:
                        names.append(s)
    except Exception:
        pass
    return names


def find_hdf5_channel_names(f: h5py.File) -> Optional[List[str]]:
    """Search HDF5 container for channel labels."""
    target_keys = ["channels", "clab", "labels", "chanlocs", "channel_names", "ch_names", "chan"]
    for k in target_keys:
        if k in f:
            obj = f[k]
            if isinstance(obj, h5py.Dataset):
                names = extract_strings_from_hdf5_dataset(f, obj)
                if len(names) >= 2:
                    return names
            elif isinstance(obj, h5py.Group):
                for sub_k in ["labels", "label", "name", "channel"]:
                    if sub_k in obj and isinstance(obj[sub_k], h5py.Dataset):
                        names = extract_strings_from_hdf5_dataset(f, obj[sub_k])
                        if len(names) >= 2:
                            return names
    return None


def find_hdf5_sampling_rate(f: h5py.File) -> Optional[float]:
    """Search HDF5 container for sampling rate metadata."""
    keys = ["fs", "Fs", "FS", "sampling_rate", "sample_rate", "srate", "sfreq", "frequency"]
    for k in keys:
        if k in f:
            try:
                obj = f[k]
                if isinstance(obj, h5py.Dataset):
                    val = np.asarray(obj[()]).squeeze()
                    if val.size == 1:
                        fs = float(val)
                        if 1.0 <= fs <= 10000.0:
                            return fs
            except Exception:
                pass
    for attr in keys:
        if attr in f.attrs:
            try:
                val = float(np.asarray(f.attrs[attr]).squeeze())
                if 1.0 <= val <= 10000.0:
                    return val
            except Exception:
                pass
    return None


def extract_channel_names_from_mat_file(path: Path) -> Optional[List[str]]:
    """
    Extract channel labels from a standalone channel montage / locations .mat file
    (e.g. chan.mat, chanlocs.mat, channels.mat).
    """
    # 1. Try scipy.io
    try:
        mat_dict = sio.loadmat(path, squeeze_me=False, struct_as_record=False)
        for k in ["chan", "chans", "channels", "clab", "labels", "chanlocs", "channel_names", "ch_names", "electrode", "electrodes", "montage"]:
            if k in mat_dict:
                names = find_mat_channel_names(mat_dict[k])
                if names and is_valid_channel_list(names):
                    return names
        names = find_mat_channel_names(mat_dict)
        if names and is_valid_channel_list(names):
            return names
    except Exception:
        pass

    # 2. Try h5py (MATLAB v7.3)
    try:
        with h5py.File(path, "r") as f:
            names = find_hdf5_channel_names(f)
            if names and is_valid_channel_list(names):
                return names
            for key in f.keys():
                obj = f[key]
                if isinstance(obj, h5py.Dataset):
                    cand = extract_strings_from_hdf5_dataset(f, obj)
                    if cand and is_valid_channel_list(cand):
                        return cand
    except Exception:
        pass

    return None


def extract_channel_names_from_table_file(path: Path) -> Optional[List[str]]:
    """Extract channel names from TSV/CSV metadata file (e.g. BIDS channels.tsv)."""
    try:
        import csv
        sep = "\t" if path.suffix.lower() == ".tsv" else ","
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f, delimiter=sep)
            rows = list(reader)
        if not rows:
            return None
        header = [c.strip().lower() for c in rows[0]]
        target_idx = None
        for col in ["name", "channel", "channels", "label", "labels", "ch_name"]:
            if col in header:
                target_idx = header.index(col)
                break
        if target_idx is not None:
            names = [row[target_idx].strip() for row in rows[1:] if len(row) > target_idx and row[target_idx].strip()]
            if is_valid_channel_list(names):
                return names
    except Exception:
        pass
    return None


def extract_channel_names_from_companion_file(path: Path) -> Optional[List[str]]:
    """Extract channel names from a companion MAT, TSV, or CSV metadata file."""
    ext = path.suffix.lower()
    if ext == ".mat":
        return extract_channel_names_from_mat_file(path)
    if ext in {".tsv", ".csv", ".txt"}:
        return extract_channel_names_from_table_file(path)
    return None


def extract_mcos_table_signals(
    mat_dict: Any
) -> Optional[Tuple[np.ndarray, Optional[float], Optional[List[str]]]]:
    """
    Extract continuous EEG signals, sampling rate, and channel names from
    MATLAB MCOS table objects serialized inside the Level 5 workspace stream
    (__function_workspace__).

    In MATLAB MCOS tables (e.g. Dr. Monika Prucnal's ADHD/Control dataset),
    scipy.io.loadmat stores opaque MATLAB objects as MatlabOpaque and places
    the raw serialized workspace bytes into __function_workspace__.
    This parser extracts the miDOUBLE signal streams and table property metadata.
    """
    if not isinstance(mat_dict, dict):
        return None

    ws = mat_dict.get("__function_workspace__")
    if ws is None:
        for k in mat_dict:
            if "workspace" in str(k).lower() and hasattr(mat_dict[k], "tobytes"):
                ws = mat_dict[k]
                break
    if ws is None:
        return None

    b = ws.tobytes() if hasattr(ws, "tobytes") else bytes(ws)
    if len(b) < 1024:
        return None

    # Scan for miDOUBLE data blocks (type 9)
    type_9 = struct.pack("<I", 9)
    blocks: List[Tuple[int, int, np.ndarray]] = []
    offset = 0
    b_len = len(b)

    while True:
        idx = b.find(type_9, offset)
        if idx == -1:
            break
        if idx + 8 <= b_len:
            nb = struct.unpack("<I", b[idx + 4 : idx + 8])[0]
            # Must be a multiple of 8 and at least 1280 samples (10240 bytes)
            if nb >= 10240 and nb % 8 == 0 and idx + 8 + nb <= b_len:
                ns = nb // 8
                arr = np.frombuffer(b[idx + 8 : idx + 8 + nb], dtype="<f8")
                if not np.any(np.isnan(arr[:64])):
                    blocks.append((idx, ns, arr))
        offset = idx + 4

    if not blocks:
        return None

    # Group candidate blocks by sample length
    by_len: Dict[int, List[Tuple[int, np.ndarray]]] = {}
    for idx, ns, arr in blocks:
        by_len.setdefault(ns, []).append((idx, arr))

    # Identify lengths that contain multiple channels (at least 2 channels, >= 1280 samples)
    valid_lens = [ns for ns, blist in by_len.items() if len(blist) >= 2 and ns >= 1280]
    if not valid_lens:
        return None

    # Choose the length with the most channels
    best_len = max(valid_lens, key=lambda ns: len(by_len[ns]))
    matched_blocks = by_len[best_len]

    # Separate time vector(s) from signal vectors
    time_vectors: List[Tuple[int, np.ndarray, float]] = []
    signal_vectors: List[Tuple[int, np.ndarray]] = []
    fs_detected: Optional[float] = None

    for idx, arr in matched_blocks:
        diffs = np.diff(arr[:1000])
        # Check if strictly monotonic linear ramp
        if np.all(diffs > 0) and (np.max(diffs) - np.min(diffs)) < (1e-3 * np.median(diffs) + 1e-6):
            median_step = float(np.median(diffs))
            time_vectors.append((idx, arr, median_step))
        else:
            signal_vectors.append((idx, arr))

    # Compute sampling rate from time vector if present
    if time_vectors:
        step = time_vectors[0][2]
        if step >= 0.5:  # Milliseconds
            dt_sec = step / 1000.0
        else:  # Seconds
            dt_sec = step
        if dt_sec > 0:
            fs_calc = round(1.0 / dt_sec, 2)
            if 1.0 <= fs_calc <= 10000.0:
                fs_detected = fs_calc

    if not signal_vectors:
        return None

    # Sort signal vectors by their binary offset order in the file
    signal_vectors.sort(key=lambda x: x[0])
    signal_matrix = np.column_stack([arr for _, arr in signal_vectors])

    # Extract channel names from metadata bytes
    ch_matches = re.findall(rb'EEG[A-Za-z0-9_]+', b)
    cleaned_names: List[str] = []
    for c in ch_matches:
        s = c.decode("ascii", errors="ignore")
        clean = re.sub(r"^EEG", "", s, flags=re.IGNORECASE)
        clean = re.sub(r"[-_](AA|A1|A2|LE|REF|AV)$", "", clean, flags=re.IGNORECASE)
        if clean and clean not in cleaned_names:
            cleaned_names.append(clean)

    if len(cleaned_names) == signal_matrix.shape[1]:
        final_names = cleaned_names
    elif signal_matrix.shape[1] == REQUIRED_CHANNELS:
        final_names = list(MODEL_CHANNEL_NAMES)
    else:
        final_names = None

    return signal_matrix, fs_detected, final_names


def read_mat_file(
    path: Path,
    sampling_rate_override: Optional[float] = None,
    fallback_channel_names: Optional[List[str]] = None
) -> EEGRecording:
    """
    Parse a MATLAB .mat file (numeric matrix, Mendeley structured object, or HDF5 v7.3).

    Parameters:
        path: Path to .mat file
        sampling_rate_override: Optional user-supplied sampling rate
        fallback_channel_names: Optional channel labels provided by companion montage file

    Returns:
        EEGRecording standard object
    """
    warnings: List[str] = []
    candidates: List[Tuple[str, np.ndarray]] = []
    fs: Optional[float] = (
        float(sampling_rate_override)
        if (sampling_rate_override is not None and float(sampling_rate_override) > 0)
        else None
    )
    channel_names: Optional[List[str]] = None
    format_type = "MATLAB"

    # Attempt 1: Standard MATLAB (v5 / v7) via scipy.io
    try:
        mat_dict = sio.loadmat(path, squeeze_me=False, struct_as_record=False)
        candidates = extract_numeric_arrays_recursively(mat_dict)

        # Check for MATLAB MCOS table objects / serialized workspace streams
        mcos_res = extract_mcos_table_signals(mat_dict)
        if mcos_res is not None:
            mcos_data, mcos_fs, mcos_chs = mcos_res
            candidates.append(("mcos_table_signals", mcos_data))
            if fs is None and mcos_fs is not None:
                fs = mcos_fs
                warnings.append(f"Auto-detected sampling rate {fs:g} Hz from MCOS timestamp vector.")
            if channel_names is None and mcos_chs:
                channel_names = mcos_chs
                warnings.append(f"Extracted {len(channel_names)} channel names from MCOS table headers.")
            warnings.append("Parsed EEG signals from MATLAB MCOS table object.")

        if fs is None:
            fs = find_mat_sampling_rate(mat_dict)

        if channel_names is None:
            channel_names = find_mat_channel_names(mat_dict)

    except Exception as std_error:
        # Attempt 2: MATLAB v7.3 (HDF5 based)
        try:
            with h5py.File(path, "r") as f:
                def visitor(name, obj):
                    if isinstance(obj, h5py.Dataset):
                        try:
                            if len(obj.shape) == 2 and is_signal_candidate(np.empty(obj.shape)):
                                data_slice = np.asarray(obj[()], dtype=np.float64)
                                candidates.append((name, data_slice))
                            elif len(obj.shape) == 3 and is_signal_candidate(np.empty(obj.shape)):
                                data_slice = np.asarray(obj[()], dtype=np.float64)
                                c2d = convert_3d_to_2d_eeg(data_slice)
                                candidates.append((name, c2d))
                        except Exception:
                            pass
                f.visititems(visitor)

                if fs is None:
                    fs = find_hdf5_sampling_rate(f)
                if channel_names is None:
                    channel_names = find_hdf5_channel_names(f)

            format_type = "MATLAB v7.3 (HDF5)"
            warnings.append("MATLAB v7.3 / HDF5 container format detected.")

        except Exception as hdf_error:
            raise ValueError(
                f"Failed to read MATLAB file '{path.name}'. "
                f"Standard parser error: {std_error}. "
                f"HDF5 parser error: {hdf_error}."
            )

    raw_arr, selected_var_name = select_best_eeg_array(candidates)

    # Apply fallback channel names if none detected internally
    if (not channel_names) and fallback_channel_names:
        r, c = (raw_arr.shape[0], raw_arr.shape[1]) if raw_arr.ndim == 2 else (0, 0)
        ch_len = len(fallback_channel_names)
        if c == ch_len or r == ch_len or ch_len >= min(r, c):
            channel_names = fallback_channel_names
            warnings.append(
                f"Applied {len(channel_names)} channel names from companion metadata file."
            )

    # Detect and normalize orientation to (time, channels)
    oriented_arr, transposed = detect_and_orient_time_dimension(raw_arr, channel_names)
    if transposed:

        warnings.append(
            f"Transposed matrix from {raw_arr.shape} to (samples={oriented_arr.shape[0]}, "
            f"channels={oriented_arr.shape[1]})."
        )

    # Sampling rate fallback handling: data-driven detection (no hardcoded filenames)
    if fs is None or fs <= 0:
        detected_hum_fs = None
        if oriented_arr.ndim == 2 and oriented_arr.shape[0] >= 512:
            try:
                detected_hum_fs = estimate_sampling_rate_from_signal(oriented_arr[:, 0])
            except Exception:
                pass

        if detected_hum_fs is not None:
            fs = detected_hum_fs
            warnings.append(
                f"Sampling rate not found in metadata; auto-detected {fs:g} Hz from powerline spectral peak."
            )
        elif oriented_arr.shape[0] % 7680 == 0 or oriented_arr.shape[0] % 2560 == 0:
            fs = 256.0
            warnings.append(
                f"Sampling rate not found in metadata; inferred {fs:g} Hz from standard epoch length."
            )
        else:
            fs = TARGET_FS
            warnings.append(
                f"Sampling rate was not found in MATLAB metadata; using default {TARGET_FS:g} Hz."
            )



    log_pipeline_step(
        "PARSER",
        f"Parsed MAT: variable '{selected_var_name}', shape {oriented_arr.shape}, fs={fs} Hz"
    )

    return EEGRecording(
        data=oriented_arr,
        sampling_rate=fs,
        channel_names=channel_names,
        source_format=format_type,
        file_name=path.name,
        original_shape=raw_arr.shape,
        warnings=warnings,
        metadata={
            "variable_name": selected_var_name,
            "candidates_found": len(candidates)
        }
    )
