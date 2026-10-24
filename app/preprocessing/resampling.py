import math
from typing import Tuple
import numpy as np
from scipy import signal

from app.config import TARGET_FS
from app.utils.logging import log_pipeline_step


def resample_eeg_signal(
    data: np.ndarray,
    current_fs: float,
    target_fs: float = TARGET_FS
) -> Tuple[np.ndarray, float, bool]:
    """
    Resample EEG data along the time axis (axis 0) using polyphase filtering.

    Parameters:
        data: np.ndarray of shape (time, channels)
        current_fs: Original sampling rate in Hz
        target_fs: Target sampling rate (default 128.0 Hz)

    Returns:
        resampled_data: np.ndarray of shape (resampled_time, channels)
        effective_fs: float
        resampled: bool
    """
    if abs(float(current_fs) - float(target_fs)) < 1e-4:
        return data, target_fs, False

    log_pipeline_step(
        "RESAMPLE",
        f"Resampling EEG from {current_fs:g} Hz to {target_fs:g} Hz..."
    )

    g = math.gcd(int(round(current_fs)), int(round(target_fs)))
    up = int(round(target_fs)) // g
    down = int(round(current_fs)) // g

    resampled = signal.resample_poly(data, up, down, axis=0)

    log_pipeline_step(
        "RESAMPLE",
        f"Resampling completed: shape transformed from {data.shape} to {resampled.shape}"
    )

    return resampled, target_fs, True
