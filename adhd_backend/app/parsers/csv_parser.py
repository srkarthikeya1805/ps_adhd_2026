from pathlib import Path
from typing import List, Optional, Tuple
import numpy as np
import pandas as pd

from app.config import TARGET_FS
from app.parsers.base import EEGRecording
from app.preprocessing.channels import detect_and_orient_time_dimension
from app.utils.logging import log_pipeline_step


METADATA_COLUMN_NAMES = {
    "time", "timestamp", "t", "seconds", "sec",
    "sample", "index", "idx", "label", "class",
    "target", "subject", "id", "age", "sex", "gender"
}

SAMPLING_RATE_COLUMN_NAMES = {
    "sampling_rate", "sample_rate", "samplerate", "samplingrate",
    "srate", "sfreq", "fs", "frequency"
}


def read_tabular_eeg_file(
    path: Path,
    sep: str = ",",
    sampling_rate_override: Optional[float] = None
) -> EEGRecording:
    """
    Universal reader for CSV, TSV, and TXT delimited EEG files.

    Detects:
      - Header vs headerless files
      - Time / timestamp columns to automatically compute sampling frequency
      - Channel name headers
      - Embedded sampling rate columns
    """
    warnings: List[str] = []

    try:
        # Check first line for sniffing delimiter if not explicitly forced
        df = pd.read_csv(path, sep=sep, engine="python")
    except Exception as exc:
        raise ValueError(f"Could not parse delimited EEG file '{path.name}': {exc}")

    if df.empty:
        raise ValueError(f"EEG file '{path.name}' is empty.")

    detected_fs: Optional[float] = sampling_rate_override
    channel_names: Optional[List[str]] = None

    # Check for embedded sampling rate column
    for col in list(df.columns):
        col_clean = str(col).strip().lower()
        if col_clean in SAMPLING_RATE_COLUMN_NAMES:
            try:
                vals = pd.to_numeric(df[col], errors="coerce").dropna()
                if not vals.empty:
                    candidate = float(vals.iloc[0])
                    if 1.0 <= candidate <= 10000.0 and detected_fs is None:
                        detected_fs = candidate
            except Exception:
                pass
            df = df.drop(columns=[col])

    # Check for time / timestamp column to calculate sampling rate
    for col in list(df.columns):
        col_clean = str(col).strip().lower()
        if col_clean in {"time", "timestamp", "t", "seconds", "sec"}:
            try:
                time_vals = pd.to_numeric(df[col], errors="coerce").dropna().values
                if len(time_vals) > 10:
                    dt = np.diff(time_vals)
                    med_dt = float(np.median(dt))
                    if med_dt > 0:
                        calculated_fs = round(1.0 / med_dt, 2)
                        if 1.0 <= calculated_fs <= 10000.0 and detected_fs is None:
                            detected_fs = calculated_fs
                            warnings.append(
                                f"Calculated sampling rate of {detected_fs:g} Hz from '{col}' column timestamps."
                            )
            except Exception:
                pass
            df = df.drop(columns=[col])

    # Drop non-EEG metadata columns
    for col in list(df.columns):
        col_clean = str(col).strip().lower()
        if col_clean in METADATA_COLUMN_NAMES:
            df = df.drop(columns=[col])

    # Select only numeric data
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty or numeric_df.shape[1] < 2:
        # Check if columns were interpreted as objects due to stray strings
        converted = df.apply(pd.to_numeric, errors="coerce")
        numeric_df = converted.dropna(axis=1, how="all")
        if numeric_df.shape[1] < 2:
            raise ValueError(
                f"File '{path.name}' contains fewer than 2 valid numeric EEG signal columns."
            )

    # Determine channel names
    all_numeric_headers = all(
        isinstance(c, (int, float)) or str(c).strip().isdigit()
        for c in numeric_df.columns
    )
    if not all_numeric_headers:
        channel_names = [str(c).strip() for c in numeric_df.columns]

    data = numeric_df.to_numpy(dtype=np.float64)

    # Orientation: (time, channels)
    data, transposed = detect_and_orient_time_dimension(data, channel_names)
    if transposed:
        warnings.append(
            f"Transposed tabular data to (samples={data.shape[0]}, channels={data.shape[1]})."
        )

    if detected_fs is None:
        detected_fs = TARGET_FS
        warnings.append(
            f"Sampling rate could not be automatically determined from the file; "
            f"defaulted to {TARGET_FS:g} Hz."
        )

    log_pipeline_step(
        "PARSER",
        f"Parsed {path.suffix.upper()}: shape {data.shape}, channels={len(channel_names) if channel_names else 'unlabelled'}, fs={detected_fs:g} Hz"
    )

    return EEGRecording(
        data=data,
        sampling_rate=detected_fs,
        channel_names=channel_names,
        source_format=f"Tabular ({path.suffix})",
        file_name=path.name,
        original_shape=data.shape,
        warnings=warnings,
        metadata={
            "columns": list(numeric_df.columns)
        }
    )


def read_csv_file(path: Path, sampling_rate_override: Optional[float] = None) -> EEGRecording:
    """Read a CSV EEG file."""
    return read_tabular_eeg_file(path, sep=",", sampling_rate_override=sampling_rate_override)
