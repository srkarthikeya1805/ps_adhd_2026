from typing import List, Tuple
import numpy as np

from app.config import (
    OVERLAP,
    REQUIRED_CHANNELS,
    STRIDE_SAMPLES,
    TARGET_FS,
    WINDOW_SAMPLES,
    WINDOW_SECONDS,
)
from app.utils.logging import log_pipeline_step


def create_eeg_windows(
    data: np.ndarray,
    fs: float = TARGET_FS,
    window_seconds: int = WINDOW_SECONDS,
    overlap: float = OVERLAP
) -> np.ndarray:
    """
    Segment preprocessed EEG into 10-second windows with 50% overlap.

    Parameters:
        data: np.ndarray of shape (time_samples, 19)
        fs: sampling rate (default 128 Hz)
        window_seconds: duration of each window (default 10s)
        overlap: overlap fraction (default 0.5)

    Returns:
        X: np.ndarray of shape (num_windows, 1280, 19) as float32
    """
    window_samples = int(round(window_seconds * fs))
    total_samples = len(data)

    if total_samples < 2:
        raise ValueError(
            f"EEG data contains fewer than 2 samples ({total_samples}); cannot perform inference."
        )

    if total_samples < window_samples:
        tile_count = int(np.ceil(window_samples / total_samples))
        data = np.tile(data, (tile_count, 1))[:window_samples]
        total_samples = len(data)
        log_pipeline_step(
            "WINDOW",
            f"Extended short recording to {window_samples} samples to generate 1 window."
        )

    step = max(1, int(round(window_samples * (1.0 - overlap))))

    windows: List[np.ndarray] = [
        data[start : start + window_samples]
        for start in range(0, total_samples - window_samples + 1, step)
    ]

    if not windows:
        raise ValueError(
            f"Could not generate complete windows for recording with {total_samples} samples."
        )

    # For massive multi-trial recordings (e.g. >150 windows = >12 minutes of EEG),
    # uniformly subsample to 150 windows to maintain fast response times and avoid memory pressure
    total_generated = len(windows)
    if len(windows) > 150:
        indices = np.linspace(0, len(windows) - 1, 150, dtype=int)
        windows = [windows[i] for i in indices]

    X = np.asarray(windows, dtype=np.float32)

    log_pipeline_step(
        "WINDOW",
        f"Generated {total_generated} windows; using {len(X)} windows of shape {X.shape[1:]} "
        f"(stride={step} samples, duration={window_seconds}s)"
    )

    return X
