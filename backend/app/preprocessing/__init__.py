from typing import List, Tuple
import numpy as np

from app.config import REQUIRED_CHANNELS, TARGET_FS, WINDOW_SAMPLES
from app.parsers.base import EEGRecording
from app.preprocessing.channels import (
    clean_channel_name,
    detect_and_orient_time_dimension,
    map_and_reorder_channels,
)
from app.preprocessing.filtering import apply_bandpass_and_notch
from app.preprocessing.normalization import normalize_eeg
from app.preprocessing.resampling import resample_eeg_signal
from app.preprocessing.spectral import compute_spectral_profile
from app.preprocessing.windowing import create_eeg_windows
from app.utils.logging import log_pipeline_step


def process_eeg_recording(
    recording: EEGRecording
) -> Tuple[np.ndarray, np.ndarray, float, List[str], List[str]]:
    """
    Execute the complete universal preprocessing pipeline on an EEG recording:
    1. Validation
    2. Channel mapping and reordering to exact 19 model channels
    3. Polyphase resampling to 128 Hz
    4. 1–45 Hz 4th order Butterworth bandpass + 50 Hz notch filter
    5. Per-channel z-score normalization
    6. 10-second windowing with 50% overlap

    Returns:
        X: np.ndarray of shape (num_windows, 1280, 19) ready for model inference
        preprocessed_continuous: np.ndarray of shape (time, 19)
        final_fs: float (128.0)
        channel_names: List[str] (the 19 model channel names)
        warnings: List[str]
    """
    warnings: List[str] = list(recording.warnings)
    data = recording.data
    fs = recording.sampling_rate

    if recording.data is None or len(recording.data) < 2:
        raise ValueError(
            f"Recording '{recording.file_name}' contains fewer than 2 samples; cannot process."
        )

    if fs is None or fs <= 0:
        fs = TARGET_FS
        warnings.append(
            f"Sampling rate was missing or non-positive ({recording.sampling_rate}); "
            f"defaulted to model standard {TARGET_FS:g} Hz."
        )

    log_pipeline_step(
        "PIPELINE",
        f"Starting pipeline for '{recording.file_name}': initial shape {data.shape}, fs={fs:g} Hz"
    )

    # 1. Orientation check
    data, transposed = detect_and_orient_time_dimension(data, recording.channel_names)
    if transposed:
        warnings.append("Data transposed to (time_samples, channels).")

    # 2. Map and reorder channels into the exact 19 required channels
    data, channel_names, ch_warnings = map_and_reorder_channels(data, recording.channel_names)
    warnings.extend(ch_warnings)

    # 3. Resample to 128.0 Hz
    data, current_fs, resampled = resample_eeg_signal(data, fs, TARGET_FS)
    if resampled:
        warnings.append(f"Resampled signal from {fs:g} Hz to {current_fs:g} Hz.")

    # 4. Handle short EEG duration (e.g. trial sequences or short recordings < 10 seconds)
    if len(data) < WINDOW_SAMPLES:
        orig_samples = len(data)
        orig_sec = orig_samples / current_fs
        tile_count = int(np.ceil(WINDOW_SAMPLES / max(1, orig_samples)))
        data = np.tile(data, (tile_count, 1))[:WINDOW_SAMPLES]
        warnings.append(
            f"Short EEG recording duration ({orig_sec:.2f}s, {orig_samples} samples). "
            f"Signal was periodically extended to the required 10.0s window ({WINDOW_SAMPLES} samples at {current_fs:g} Hz) "
            f"to enable deep learning model inference."
        )
        log_pipeline_step(
            "PIPELINE",
            f"Short recording '{recording.file_name}' ({orig_samples} samples) extended to {WINDOW_SAMPLES} samples for inference."
        )

    # 5. Filter: 1–45 Hz bandpass + 50 Hz notch
    data = apply_bandpass_and_notch(data, current_fs)

    # 6. Normalize: per-channel z-score
    data = normalize_eeg(data)

    # 7. Developmental spectral profiling (IAF and TBR ratio)
    spec_profile = compute_spectral_profile(data, fs=current_fs)

    # 8. Windowing: 10s windows, 50% overlap -> (N, 1280, 19)
    X = create_eeg_windows(data, fs=current_fs)

    log_pipeline_step(
        "PIPELINE",
        f"Preprocessing complete for '{recording.file_name}': {len(X)} windows of shape {X.shape[1:]} (Profile: {spec_profile['profile']})"
    )

    return X, data, current_fs, channel_names, warnings


__all__ = [
    "process_eeg_recording",
    "clean_channel_name",
    "detect_and_orient_time_dimension",
    "map_and_reorder_channels",
    "resample_eeg_signal",
    "apply_bandpass_and_notch",
    "normalize_eeg",
    "create_eeg_windows"
]
