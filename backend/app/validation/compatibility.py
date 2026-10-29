from typing import Tuple
import numpy as np

from app.config import REQUIRED_CHANNELS, WINDOW_SAMPLES


def check_tensor_compatibility(X: np.ndarray) -> None:
    """
    Strict verification that the preprocessed tensor X is completely compatible
    with the loaded CNN-Transformer model before passing to predict.
    """
    if not isinstance(X, np.ndarray):
        raise TypeError(f"Expected NumPy array for model input, got {type(X).__name__}.")

    if X.ndim != 3:
        raise ValueError(f"Model requires 3-D tensor (batch, time, channels). Got shape: {X.shape}.")

    if X.shape[1] != WINDOW_SAMPLES:
        raise ValueError(
            f"Model input time dimension mismatch: expected {WINDOW_SAMPLES} samples, "
            f"got {X.shape[1]} samples."
        )

    if X.shape[2] != REQUIRED_CHANNELS:
        raise ValueError(
            f"Model input channel dimension mismatch: expected {REQUIRED_CHANNELS} channels, "
            f"got {X.shape[2]} channels."
        )

    if np.any(np.isnan(X)) or np.any(np.isinf(X)):
        raise ValueError("Model input tensor contains NaN or Inf values after preprocessing.")
