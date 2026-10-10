from typing import Tuple
import numpy as np
from scipy import signal

from app.config import HIGHCUT, LOWCUT, NOTCH_HZ
from app.utils.logging import log_pipeline_step


def apply_bandpass_and_notch(
    data: np.ndarray,
    fs: float
) -> np.ndarray:
    """
    Apply zero-phase Butterworth bandpass filter (1–45 Hz) and 50 Hz notch filter.

    Parameters:
        data: np.ndarray of shape (time, channels)
        fs: sampling rate in Hz

    Returns:
        filtered_data: np.ndarray of shape (time, channels)
    """
    # Replace non-finite values safely
    filtered = np.nan_to_num(
        data.astype(np.float64),
        nan=0.0,
        posinf=0.0,
        neginf=0.0
    )

    # 1. Bandpass filter: 1–45 Hz
    nyquist = fs / 2.0
    high = min(HIGHCUT, nyquist * 0.90)
    low = min(LOWCUT, high * 0.5)

    if low <= 0 or high <= low:
        raise ValueError(
            f"Invalid filter frequencies for fs={fs} Hz: low={low} Hz, high={high} Hz."
        )

    log_pipeline_step(
        "FILTER",
        f"Applying 4th-order Butterworth bandpass filter: {low:.1f}–{high:.1f} Hz (fs={fs} Hz)"
    )

    sos = signal.butter(4, [low, high], btype="bandpass", fs=fs, output="sos")
    filtered = signal.sosfiltfilt(sos, filtered, axis=0)

    # 2. Notch filter: 50 Hz (powerline interference)
    if NOTCH_HZ < nyquist:
        log_pipeline_step("NOTCH", f"Applying 50 Hz notch filter (Q=30, fs={fs} Hz)")
        b, a = signal.iirnotch(NOTCH_HZ, Q=30, fs=fs)
        filtered = signal.filtfilt(b, a, filtered, axis=0)

    return filtered
