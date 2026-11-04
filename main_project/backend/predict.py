"""
Predict compatibility module for backward-compatible imports and scripts.
Delegates to the modular app.* architecture while maintaining legacy signatures.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from app.config import (
    HIGHCUT,
    LOWCUT,
    MODEL_CHANNEL_NAMES,
    NOTCH_HZ,
    OVERLAP,
    REQUIRED_CHANNELS as MAX_CHANNELS,
    SUPPORTED_EXTENSIONS,
    TARGET_FS,
    WINDOW_SAMPLES,
    WINDOW_SECONDS,
)
from app.model.inference import run_inference
from app.model.model_loader import ModelManager, PositionalEmbedding
from app.parsers import (
    EEGRecording,
    extract_zip_archive_safely,
    parse_eeg_file,
    read_csv_file,
    read_edf_eeg_file,
    read_mat_file,
    read_numpy_eeg_file,
    read_tsv_file,
)
from app.preprocessing import (
    apply_bandpass_and_notch,
    clean_channel_name,
    create_eeg_windows,
    detect_and_orient_time_dimension,
    map_and_reorder_channels,
    normalize_eeg,
    process_eeg_recording,
    resample_eeg_signal,
)
from app.validation.compatibility import check_tensor_compatibility

# Pre-load model for direct script imports
model = ModelManager.get_model()


def parse_recording(path: Path) -> EEGRecording:
    """Legacy alias for parse_eeg_file."""
    return parse_eeg_file(Path(path))


def orient_time_by_channels(data: np.ndarray, channel_names: Optional[List[str]] = None) -> np.ndarray:
    """Legacy alias for detect_and_orient_time_dimension returning array."""
    oriented, _ = detect_and_orient_time_dimension(data, channel_names)
    return oriented


def adapt_channels(
    data: np.ndarray,
    channel_names: Optional[List[str]] = None
) -> Tuple[np.ndarray, List[str], List[str]]:
    """Legacy alias for map_and_reorder_channels."""
    return map_and_reorder_channels(data, channel_names)


def resample_to_target(x: np.ndarray, fs: float) -> Tuple[np.ndarray, float]:
    """Legacy alias for resample_eeg_signal."""
    resampled, new_fs, _ = resample_eeg_signal(x, fs, TARGET_FS)
    return resampled, new_fs


def preprocess_eeg(recording: EEGRecording) -> Tuple[np.ndarray, float, List[str]]:
    """Legacy preprocessing function."""
    _, continuous, fs, channels, _ = process_eeg_recording(recording)
    return continuous, fs, channels


def create_windows(data: np.ndarray, fs: float = TARGET_FS) -> np.ndarray:
    """Legacy alias for create_eeg_windows."""
    return create_eeg_windows(data, fs=fs)


def validate_model_input(X: np.ndarray) -> None:
    """Legacy alias for check_tensor_compatibility."""
    check_tensor_compatibility(X)


def predict_windows(X: np.ndarray) -> Tuple[float, str, List[float]]:
    """Legacy alias for model prediction on windows."""
    mean_prob, label, window_probs, _, _ = run_inference(X)
    return mean_prob, "ADHD Detected" if label == "ADHD" else "Control / Normal", window_probs


def preprocess_and_predict_file(path: Path) -> Tuple[float, str, Dict[str, Any]]:
    """
    Legacy entry point: preprocess EEG file and run CNN-Transformer prediction.

    Returns:
        mean_probability: float
        label: "ADHD Detected" or "Control / Normal"
        details: Dict with processing metadata and window-level probabilities
    """
    path = Path(path)
    recording = parse_eeg_file(path)
    X, continuous, final_fs, channel_names, warnings = process_eeg_recording(recording)

    mean_prob, pred_class, window_probs, window_records, agg_metrics = run_inference(X)
    label_str = "ADHD Detected" if pred_class == "ADHD" else "Control / Normal"

    details = {
        "source": recording.source_format,
        "sampling_rate_original": recording.metadata.get(
            "original_sampling_rate",
            recording.sampling_rate
        ),
        "sampling_rate_used": final_fs,
        "original_shape": list(recording.original_shape),
        "preprocessed_shape": list(continuous.shape),
        "channels_original": (
            len(recording.channel_names)
            if recording.channel_names
            else recording.data.shape[1]
        ),
        "channels_used": MAX_CHANNELS,
        "channel_names": channel_names,
        "window_seconds": WINDOW_SECONDS,
        "window_samples": WINDOW_SAMPLES,
        "overlap": OVERLAP,
        "windows": len(X),
        "warnings": warnings,
        "window_probabilities": window_probs,
        "window_records": window_records,
        "aggregate_metrics": agg_metrics
    }

    return mean_prob, label_str, details


__all__ = [
    "PositionalEmbedding",
    "ModelManager",
    "model",
    "TARGET_FS",
    "LOWCUT",
    "HIGHCUT",
    "NOTCH_HZ",
    "WINDOW_SECONDS",
    "OVERLAP",
    "MAX_CHANNELS",
    "MODEL_CHANNEL_NAMES",
    "SUPPORTED_EXTENSIONS",
    "EEGRecording",
    "parse_recording",
    "read_mat_file",
    "read_csv_file",
    "read_tsv_file",
    "read_numpy_eeg_file",
    "read_edf_eeg_file",
    "extract_zip_archive_safely",
    "orient_time_by_channels",
    "adapt_channels",
    "resample_to_target",
    "preprocess_eeg",
    "create_windows",
    "validate_model_input",
    "predict_windows",
    "preprocess_and_predict_file"
]