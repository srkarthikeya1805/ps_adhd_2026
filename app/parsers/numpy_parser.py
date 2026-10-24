from pathlib import Path
from typing import List, Optional, Tuple
import numpy as np

from app.config import TARGET_FS
from app.parsers.base import EEGRecording
from app.parsers.mat_parser import is_signal_candidate, score_candidate
from app.preprocessing.channels import detect_and_orient_time_dimension
from app.utils.logging import log_pipeline_step


def read_numpy_eeg_file(
    path: Path,
    sampling_rate_override: Optional[float] = None
) -> EEGRecording:
    """
    Parse .npy and .npz NumPy EEG files.
    """
    ext = path.suffix.lower()
    warnings: List[str] = []
    fs: Optional[float] = sampling_rate_override
    channel_names: Optional[List[str]] = None

    try:
        loaded = np.load(path, allow_pickle=True)
    except Exception as exc:
        raise ValueError(f"Could not load NumPy file '{path.name}': {exc}")

    if ext == ".npy":
        arr = np.asarray(loaded)
        if arr.ndim != 2:
            raise ValueError(
                f"NPY EEG array must be 2-dimensional. Received shape: {arr.shape}."
            )
        data = np.asarray(arr, dtype=np.float64)
        var_name = "data"

    elif ext == ".npz":
        files = loaded.files
        if not files:
            raise ValueError(f"NPZ archive '{path.name}' is empty.")

        # Check for metadata keys
        for key in files:
            clean_key = str(key).strip().lower()
            if clean_key in {"fs", "srate", "sampling_rate", "sample_rate", "sfreq"} and fs is None:
                try:
                    val = np.asarray(loaded[key]).squeeze()
                    if val.size == 1 and 1.0 <= float(val) <= 10000.0:
                        fs = float(val)
                except Exception:
                    pass

            if clean_key in {"channels", "clab", "channel_names", "ch_names"} and channel_names is None:
                try:
                    val = np.asarray(loaded[key]).ravel()
                    channel_names = [str(ch).strip() for ch in val if str(ch).strip()]
                except Exception:
                    pass

        # Identify candidate EEG arrays
        candidates: List[Tuple[float, str, np.ndarray]] = []
        for key in files:
            val = np.asarray(loaded[key])
            if is_signal_candidate(val):
                score = score_candidate(key, val)
                candidates.append((score, key, val))

        if not candidates:
            raise ValueError(f"No numeric EEG arrays found in NPZ archive '{path.name}'.")

        candidates.sort(key=lambda item: item[0], reverse=True)
        _, var_name, data = candidates[0]
        data = np.asarray(data, dtype=np.float64)

    else:
        raise ValueError(f"Unsupported NumPy format: '{ext}'.")

    # Detect orientation to (time, channels)
    data, transposed = detect_and_orient_time_dimension(data, channel_names)
    if transposed:
        warnings.append(
            f"Transposed NumPy array to (samples={data.shape[0]}, channels={data.shape[1]})."
        )

    if fs is None:
        fs = TARGET_FS
        warnings.append(
            f"Sampling rate not specified in NumPy file; defaulted to {TARGET_FS:g} Hz."
        )

    log_pipeline_step(
        "PARSER",
        f"Parsed NumPy ({ext}): shape {data.shape}, channels={len(channel_names) if channel_names else data.shape[1]}, fs={fs:g} Hz"
    )

    return EEGRecording(
        data=data,
        sampling_rate=fs,
        channel_names=channel_names,
        source_format=ext,
        file_name=path.name,
        original_shape=data.shape,
        warnings=warnings,
        metadata={"variable": var_name}
    )
