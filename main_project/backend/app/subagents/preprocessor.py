from typing import List, Tuple
import numpy as np

from app.parsers.base import EEGRecording
from app.preprocessing import process_eeg_recording
from app.utils.logging import log_pipeline_step
from app.validation.compatibility import check_tensor_compatibility


class PreprocessorSubagent:
    """
    Subagent responsible for standardizing and conditioning verified EEG signals.
    
    Transforms raw multi-channel continuous voltages into model-ready tensors:
    - Symmetrical hemispheric topographic projection for sparse channels
    - Polyphase resampling to exactly 128.0 Hz
    - 1-45 Hz 4th order Butterworth bandpass + 50 Hz notch filtering
    - Per-channel z-score normalization
    - 10-second windowing (1280 samples) with 50% overlap -> (N, 1280, 19)
    """

    @classmethod
    def process(
        cls,
        recording: EEGRecording
    ) -> Tuple[np.ndarray, np.ndarray, float, List[str], List[str]]:
        """
        Execute the universal EEG conditioning and windowing pipeline.
        """
        X, continuous_preprocessed, final_fs, channel_names, warnings = process_eeg_recording(recording)

        # Validate tensor compatibility for neural network input
        check_tensor_compatibility(X)

        log_pipeline_step(
            "PREPROCESSOR",
            f"Conditioned '{recording.file_name}': {len(X)} windows of shape (1280, 19) at {final_fs:g} Hz"
        )

        return X, continuous_preprocessed, final_fs, channel_names, warnings
