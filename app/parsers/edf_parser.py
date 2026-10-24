from pathlib import Path
from typing import List, Optional
import mne
import numpy as np

from app.parsers.base import EEGRecording
from app.preprocessing.channels import detect_and_orient_time_dimension
from app.utils.logging import log_pipeline_step


def read_edf_eeg_file(
    path: Path,
    sampling_rate_override: Optional[float] = None
) -> EEGRecording:
    """
    Parse EDF (.edf), FIF (.fif), and EEGLAB (.set) files using MNE.
    """
    ext = path.suffix.lower()
    warnings: List[str] = []

    try:
        if ext == ".edf":
            raw = mne.io.read_raw_edf(path, preload=True, verbose="ERROR")
        elif ext == ".gdf":
            try:
                raw = mne.io.read_raw_gdf(path, preload=True, verbose="ERROR")
            except Exception as gdf_err:
                # Fallback if EOG channels require explicit designation
                err_str = str(gdf_err).lower()
                if "eog" in err_str:
                    raw = mne.io.read_raw_gdf(path, eog=None, preload=True, verbose="ERROR")
                else:
                    raise gdf_err
        elif ext == ".bdf":
            raw = mne.io.read_raw_bdf(path, preload=True, verbose="ERROR")
        elif ext == ".fif":
            raw = mne.io.read_raw_fif(path, preload=True, verbose="ERROR")
        elif ext == ".set":
            raw = mne.io.read_raw_eeglab(path, preload=True, verbose="ERROR")
        else:
            raise ValueError(f"Unsupported MNE file format: '{ext}'.")
    except Exception as exc:
        raise ValueError(f"Could not load MNE recording '{path.name}': {exc}")

    # Pick EEG channels
    picks = mne.pick_types(raw.info, eeg=True, exclude="bads")
    if len(picks) < 2:
        # Fallback: select all channels except trigger, status, and artifact channels
        ignored_ch_names = {"status", "trigger", "stim", "eog", "ecg", "emg"}
        picks = [
            i for i, ch in enumerate(raw.ch_names)
            if not any(ign in ch.lower() for ign in ignored_ch_names)
        ]
        if len(picks) < 2:
            picks = list(range(len(raw.ch_names)))
        if len(picks) < 2:
            raise ValueError(f"File '{path.name}' contains fewer than 2 valid channels.")
        warnings.append(
            f"{ext.upper()[1:]} channels were not explicitly tagged as EEG; selected {len(picks)} signal channels."
        )

    # raw.get_data() returns shape (channels, time) -> transpose to (time, channels)
    data = raw.get_data(picks=picks).T.astype(np.float64)
    channel_names = [raw.ch_names[i] for i in picks]

    detected_fs = sampling_rate_override or float(raw.info["sfreq"])

    # Ensure orientation is (time, channels)
    data, transposed = detect_and_orient_time_dimension(data, channel_names)
    if transposed:
        warnings.append("Transposed MNE data array to (time, channels).")

    log_pipeline_step(
        "PARSER",
        f"Parsed MNE ({ext.upper()[1:]}): shape {data.shape}, channels={len(channel_names)}, fs={detected_fs:g} Hz"
    )

    return EEGRecording(
        data=data,
        sampling_rate=detected_fs,
        channel_names=channel_names,
        source_format=f"MNE ({ext.upper()[1:]})",
        file_name=path.name,
        original_shape=data.shape,
        warnings=warnings,
        metadata={
            "sfreq": float(raw.info["sfreq"]),
            "n_channels": len(channel_names)
        }
    )

