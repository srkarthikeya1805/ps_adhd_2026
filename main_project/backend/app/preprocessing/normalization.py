import numpy as np

from app.utils.logging import log_pipeline_step


def normalize_eeg(data: np.ndarray) -> np.ndarray:
    """
    Apply per-channel zero-mean, unit-variance z-score normalization.

    Parameters:
        data: np.ndarray of shape (time, channels)

    Returns:
        normalized_data: np.ndarray of shape (time, channels)
    """
    mu = np.mean(data, axis=0, keepdims=True)
    std = np.std(data, axis=0, keepdims=True) + 1e-8
    normalized = (data - mu) / std

    log_pipeline_step(
        "NORMALIZE",
        "Applied per-channel zero-mean unit-variance z-score normalization."
    )
    return normalized
