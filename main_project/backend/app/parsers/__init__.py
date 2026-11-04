from pathlib import Path
from typing import List, Optional

from app.config import SUPPORTED_EXTENSIONS
from app.parsers.base import EEGRecording
from app.parsers.csv_parser import read_csv_file
from app.parsers.edf_parser import read_edf_eeg_file
from app.parsers.mat_parser import (
    extract_channel_names_from_companion_file,
    extract_channel_names_from_mat_file,
    read_mat_file,
)
from app.parsers.numpy_parser import read_numpy_eeg_file
from app.parsers.tsv_parser import read_tsv_file
from app.parsers.zip_parser import extract_zip_archive_safely


def parse_eeg_file(
    path: Path,
    sampling_rate_override: Optional[float] = None,
    fallback_channel_names: Optional[List[str]] = None
) -> EEGRecording:
    """
    Universal EEG parser entry point.
    Dispatches to format-specific parser based on file extension.
    """
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    ext = path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported EEG format '{ext}'. "
            f"Supported formats: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    if ext == ".mat":
        recording = read_mat_file(
            path,
            sampling_rate_override=sampling_rate_override,
            fallback_channel_names=fallback_channel_names
        )
    elif ext == ".csv":
        recording = read_csv_file(path, sampling_rate_override=sampling_rate_override)
    elif ext in {".tsv", ".txt"}:
        recording = read_tsv_file(path, sampling_rate_override=sampling_rate_override)
    elif ext in {".npy", ".npz"}:
        recording = read_numpy_eeg_file(path, sampling_rate_override=sampling_rate_override)
    elif ext in {".edf", ".fif", ".set", ".gdf", ".bdf"}:
        recording = read_edf_eeg_file(path, sampling_rate_override=sampling_rate_override)
    else:
        raise ValueError(f"No parser registered for extension: {ext}")

    # Fallback channel names assignment if parser did not detect internal labels
    if (not recording.channel_names) and fallback_channel_names:
        num_ch = recording.data.shape[1] if recording.data.ndim == 2 else 0
        if len(fallback_channel_names) >= num_ch and num_ch > 0:
            recording.channel_names = list(fallback_channel_names[:num_ch])
            recording.warnings.append(
                f"Applied {num_ch} channel names from companion metadata file."
            )

    return recording


__all__ = [
    "EEGRecording",
    "parse_eeg_file",
    "read_mat_file",
    "read_csv_file",
    "read_tsv_file",
    "read_numpy_eeg_file",
    "read_edf_eeg_file",
    "extract_zip_archive_safely",
    "extract_channel_names_from_mat_file",
    "extract_channel_names_from_companion_file"
]

