import re
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from app.config import (
    CHANNEL_ALIASES,
    MODEL_CHANNEL_NAMES,
    REQUIRED_CHANNELS,
)


def clean_channel_name(name: Any) -> str:
    """
    Normalize channel names:
    - Uppercase
    - Remove prefixes like 'EEG', 'CH', 'CHANNEL'
    - Remove suffixes like '-REF', '-LE', '_REF'
    - Strip punctuation and spaces

    Examples:
        'EEG Fp1-REF' -> 'FP1'
        'Fp-1'         -> 'FP1'
        't7'           -> 'T7'
        'EEG CZ'       -> 'CZ'
    """
    text = str(name).strip().upper()
    text = re.sub(r"^EEG[:\s\-_]*", "", text)
    text = re.sub(r"[-_](REF|LE|AA|A1|A2|AV)$", "", text)
    text = text.replace(" ", "").replace("-", "").replace("_", "").replace(":", "").replace(".", "")
    return text




def detect_and_orient_time_dimension(
    data: np.ndarray,
    channel_names: Optional[List[str]] = None
) -> Tuple[np.ndarray, bool]:
    """
    Detect whether data is (time, channels) or (channels, time) and orient to (time, channels).

    Returns:
        oriented_data: np.ndarray of shape (samples, channels)
        was_transposed: bool
    """
    if data.ndim != 2:
        raise ValueError(f"EEG data must be 2-dimensional. Received shape: {data.shape}")

    rows, cols = data.shape

    # If channel names are provided, use them to resolve orientation unambiguously
    if channel_names:
        if len(channel_names) == cols:
            return data, False
        if len(channel_names) == rows:
            return data.T, True

    # Common heuristic: channels are usually few (<= 128), samples are many (>= 256)
    if rows <= REQUIRED_CHANNELS and cols > rows:
        return data.T, True

    if cols <= REQUIRED_CHANNELS and rows > cols:
        return data, False

    # Fallback heuristic: time is almost always the longer dimension in continuous EEG recordings
    if rows < cols:
        return data.T, True

    return data, False


def build_alias_lookup() -> Dict[str, str]:
    """Build a normalized lookup table from alias string to target model channel name."""
    lookup: Dict[str, str] = {}
    for target, aliases in CHANNEL_ALIASES.items():
        # Match target itself
        lookup[clean_channel_name(target)] = target
        for alias in aliases:
            lookup[clean_channel_name(alias)] = target
    return lookup


ALIAS_LOOKUP = build_alias_lookup()


def project_sparse_to_19_channels(data: np.ndarray) -> np.ndarray:
    """
    Project low-density channel recordings (e.g. 2-channel portable headsets)
    into standard 19-channel 10-20 layout using hemispheric symmetry projection.
    """
    time_samples, num_channels = data.shape
    projected = np.zeros((time_samples, REQUIRED_CHANNELS), dtype=np.float64)
    if num_channels == 1:
        projected[:] = data[:, 0:1]
        return projected

    if num_channels == 2:
        left = data[:, 0]
        right = data[:, 1]
        mid = 0.5 * (left + right)
        # Left hemisphere channels: Fp1, F7, F3, T3, C3, T5, P3, O1
        for idx in [0, 2, 3, 7, 8, 12, 13, 17]:
            projected[:, idx] = left
        # Right hemisphere channels: Fp2, F8, F4, T4, C4, T6, P4, O2
        for idx in [1, 5, 6, 10, 11, 15, 16, 18]:
            projected[:, idx] = right
        # Midline channels: Fz, Cz, Pz
        for idx in [4, 9, 14]:
            projected[:, idx] = mid
        return projected

    # General sparse channel interpolation
    for i in range(REQUIRED_CHANNELS):
        src_idx = int(round(i * (num_channels - 1) / (REQUIRED_CHANNELS - 1)))
        projected[:, i] = data[:, min(src_idx, num_channels - 1)]
    return projected


def map_and_reorder_channels(
    data: np.ndarray,
    channel_names: Optional[List[str]] = None
) -> Tuple[np.ndarray, List[str], List[str]]:
    """
    Map and reorder input channels into the exact 19 channels required by the model:
    ['Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8', 'T3', 'C3', 'Cz', 'C4', 'T4', 'T5', 'P3', 'Pz', 'P4', 'T6', 'O1', 'O2']

    Parameters:
        data: np.ndarray of shape (time, channels)
        channel_names: Optional list of channel names

    Returns:
        reordered_data: np.ndarray of shape (time, 19)
        final_channel_names: List[str] matching MODEL_CHANNEL_NAMES
        warnings: List[str]
    """
    time_samples, num_channels = data.shape
    warnings_list: List[str] = []

    # CASE 1: No channel names provided
    if not channel_names:
        if num_channels == REQUIRED_CHANNELS:
            warnings_list.append(
                f"No channel names were provided. Assuming standard 19-channel 10-20 layout "
                f"in model order: {', '.join(MODEL_CHANNEL_NAMES)}."
            )
            return data, MODEL_CHANNEL_NAMES.copy(), warnings_list

        if num_channels < REQUIRED_CHANNELS:
            projected = project_sparse_to_19_channels(data)
            warnings_list.append(
                f"Recording has {num_channels} sparse channels without names. "
                f"Applied hemispheric topographic projection to standard {REQUIRED_CHANNELS} channels."
            )
            return projected, MODEL_CHANNEL_NAMES.copy(), warnings_list

        # num_channels > REQUIRED_CHANNELS
        truncated = data[:, :REQUIRED_CHANNELS]
        warnings_list.append(
            f"Recording has {num_channels} channels without names. "
            f"Selected first {REQUIRED_CHANNELS} channels for model input."
        )
        return truncated, MODEL_CHANNEL_NAMES.copy(), warnings_list

    # CASE 2: Channel names provided
    cleaned_input_names = [clean_channel_name(ch) for ch in channel_names]

    # Map each input column index to a model target channel
    input_to_model: Dict[str, int] = {}
    for idx, clean_ch in enumerate(cleaned_input_names):
        target = ALIAS_LOOKUP.get(clean_ch)
        if target and target not in input_to_model:
            input_to_model[target] = idx

    # Check whether all 19 model channels are present
    target_model_clean = [clean_channel_name(ch) for ch in MODEL_CHANNEL_NAMES]
    missing_channels = [
        MODEL_CHANNEL_NAMES[i]
        for i, target_clean in enumerate(target_model_clean)
        if target_clean not in input_to_model
    ]

    # If all 19 channels mapped cleanly
    if not missing_channels:
        reordered = np.zeros((time_samples, REQUIRED_CHANNELS), dtype=np.float64)
        for i, target_clean in enumerate(target_model_clean):
            src_col = input_to_model[target_clean]
            reordered[:, i] = data[:, src_col]
        return reordered, MODEL_CHANNEL_NAMES.copy(), warnings_list

    # If the file has exactly 19 channels but unfamiliar names
    matched_count = len(target_model_clean) - len(missing_channels)
    if num_channels == REQUIRED_CHANNELS and matched_count < 5:
        warnings_list.append(
            f"Channel names ({channel_names}) did not match standard 10-20 aliases, "
            f"but recording has exactly 19 channels. Preserving original channel order mapped to model."
        )
        return data, MODEL_CHANNEL_NAMES.copy(), warnings_list

    # Partial channel match: place matched channels and zero-pad missing channels (Colab pad_channels)
    reordered = np.zeros((time_samples, REQUIRED_CHANNELS), dtype=np.float64)
    for i, target_clean in enumerate(target_model_clean):
        if target_clean in input_to_model:
            src_col = input_to_model[target_clean]
            reordered[:, i] = data[:, src_col]

    missing_formatted = ", ".join(missing_channels)
    warnings_list.append(
        f"Missing channels [{missing_formatted}] were zero-padded to maintain 19-channel tensor compatibility."
    )
    return reordered, MODEL_CHANNEL_NAMES.copy(), warnings_list
