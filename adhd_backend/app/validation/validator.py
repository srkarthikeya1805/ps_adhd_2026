from pathlib import Path
from typing import List, Optional
import numpy as np

from app.config import (
    MODEL_CHANNEL_NAMES,
    REQUIRED_CHANNELS,
    TARGET_FS,
    WINDOW_SAMPLES,
    WINDOW_SECONDS,
)
from app.parsers import parse_eeg_file
from app.preprocessing import (
    clean_channel_name,
    detect_and_orient_time_dimension,
    map_and_reorder_channels,
)
from app.preprocessing.channels import ALIAS_LOOKUP
from app.schemas.responses import ValidationReport
from app.utils.logging import log_pipeline_step


def validate_eeg_file(
    path: Path,
    sampling_rate_override: Optional[float] = None
) -> ValidationReport:
    """
    Validate an EEG file for compatibility with the CNN-Transformer ADHD model pipeline
    without executing inference.
    """
    issues: List[str] = []
    warnings: List[str] = []
    filename = path.name

    # 1. Parse recording
    try:
        recording = parse_eeg_file(path, sampling_rate_override=sampling_rate_override)
        warnings.extend(recording.warnings)
    except Exception as exc:
        return ValidationReport(
            file=filename,
            valid=False,
            format=path.suffix.lower(),
            issues=[f"Parser error: {exc}"],
            warnings=warnings,
            model_compatible=False
        )

    data = recording.data
    fs = recording.sampling_rate
    channel_names = recording.channel_names

    # 2. Check signal structure
    if not isinstance(data, np.ndarray) or data.ndim != 2:
        issues.append(f"EEG data must be a 2-D array. Received shape: {getattr(data, 'shape', None)}.")
        return ValidationReport(
            file=filename,
            valid=False,
            format=recording.source_format,
            issues=issues,
            warnings=warnings,
            model_compatible=False
        )

    # 3. Orient data
    data, _ = detect_and_orient_time_dimension(data, channel_names)
    samples_count, channels_count = data.shape

    # 4. Check sampling rate
    if fs is None or fs <= 0 or not np.isfinite(fs):
        issues.append(
            "Sampling rate could not be determined automatically. "
            "Please provide 'sampling_rate' parameter in the request."
        )

    # 5. Check channels and compatibility
    required_channels_available = False
    if channel_names:
        cleaned_input = [clean_channel_name(ch) for ch in channel_names]
        mapped_targets = {ALIAS_LOOKUP.get(ch) for ch in cleaned_input if ALIAS_LOOKUP.get(ch)}
        target_model_clean = [clean_channel_name(ch) for ch in MODEL_CHANNEL_NAMES]
        missing = [ch for ch in target_model_clean if ch not in mapped_targets]

        if not missing:
            required_channels_available = True
        elif channels_count == REQUIRED_CHANNELS:
            required_channels_available = True
            warnings.append(
                f"Channel names ({channel_names}) did not match standard aliases, "
                f"but recording has exactly 19 channels."
            )
        else:
            issues.append(
                f"Missing required EEG channels: {missing}. Available channels: {channel_names}."
            )
    else:
        if channels_count == REQUIRED_CHANNELS:
            required_channels_available = True
            warnings.append(
                "Recording has 19 channels without names; standard 10-20 layout will be assumed."
            )
        else:
            issues.append(
                f"Recording has {channels_count} channels without names. "
                f"The model requires exactly {REQUIRED_CHANNELS} channels."
            )

    # 6. Check duration
    duration_sec: Optional[float] = None
    windows_count: Optional[int] = None
    if fs is not None and fs > 0:
        duration_sec = round(samples_count / fs, 2)
        if duration_sec < WINDOW_SECONDS:
            issues.append(
                f"Recording duration ({duration_sec}s) is shorter than the required "
                f"{WINDOW_SECONDS} seconds for model windowing."
            )
        else:
            # Estimate window count at target 128 Hz
            effective_samples = int(round(duration_sec * TARGET_FS))
            step = int(round(WINDOW_SAMPLES * 0.5))
            windows_count = max(0, (effective_samples - WINDOW_SAMPLES) // step + 1)

    is_valid = len(issues) == 0
    is_compatible = is_valid and required_channels_available

    log_pipeline_step(
        "VALIDATE",
        f"Validation for '{filename}': valid={is_valid}, compatible={is_compatible}, issues={len(issues)}"
    )

    return ValidationReport(
        file=filename,
        valid=is_valid,
        format=recording.source_format,
        signal_shape=list(recording.original_shape),
        sampling_rate=fs,
        target_sampling_rate=TARGET_FS,
        channels_detected=channels_count,
        channel_names=channel_names,
        required_channels_available=required_channels_available,
        duration_seconds=duration_sec,
        windows_count=windows_count,
        model_compatible=is_compatible,
        issues=issues,
        warnings=warnings
    )
