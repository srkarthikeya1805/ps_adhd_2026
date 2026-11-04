from pathlib import Path
from typing import Optional

from app.parsers.base import EEGRecording
from app.parsers.csv_parser import read_tabular_eeg_file


def read_tsv_file(path: Path, sampling_rate_override: Optional[float] = None) -> EEGRecording:
    """Read a tab-separated (.tsv or .txt) EEG file."""
    return read_tabular_eeg_file(path, sep="\t", sampling_rate_override=sampling_rate_override)
