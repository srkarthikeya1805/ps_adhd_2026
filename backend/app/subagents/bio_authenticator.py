from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from scipy import signal

from app.config import TARGET_FS
from app.utils.logging import log_pipeline_step

# Keywords indicating experimental task logs, stimulus events, and behavioral metrics
TASK_METADATA_KEYWORDS = {
    "trial", "trials", "trial_sequence", "trial_sequences", "trialsequence",
    "trial_seq", "trial_num", "trial_number", "trial_id", "trial_idx",
    "stimulus", "stimuli", "stim", "stim_id", "stim_name", "stim_type",
    "stimulus_type", "stim_code", "stimulus_code", "condition", "conditions",
    "cond", "block", "block_num", "block_number", "block_id", "response",
    "resp", "reaction_time", "reactiontime", "rt", "rt_ms", "rt_sec",
    "keypress", "key", "key_pressed", "correct", "accuracy", "acc",
    "error", "target", "target_code", "cue", "fixation", "iti", "isi",
    "soa", "feedback", "reward", "score", "points", "session", "run",
    "event_type", "event_id", "trigger_code", "timing", "timings"
}

# Standard 10-20 EEG electrode names and biological prefixes
STANDARD_EEG_NAMES = {
    "fp1", "fp2", "f7", "f3", "fz", "f4", "f8", "t3", "c3", "cz", "c4", "t4",
    "t5", "p3", "pz", "p4", "t6", "o1", "o2", "t7", "t8", "p7", "p8", "af3",
    "af4", "afz", "fc1", "fc2", "fc5", "fc6", "cp1", "cp2", "cp5", "cp6",
    "po3", "po4", "poz", "oz", "fpz", "eeg"
}


@dataclass
class BioAuthResult:
    """Result of physiological EEG signal authenticity evaluation."""
    is_valid_eeg: bool
    signal_type: str
    rejection_reason: Optional[str] = None
    confidence_score: float = 1.0
    details: Dict[str, Any] = field(default_factory=dict)


class BioSignalAuthenticatorSubagent:
    """
    Subagent responsible for neurophysiological EEG bio-signal authentication.
    
    Verifies that numeric time-series represent genuine electrophysiological brainwave
    oscillations rather than non-EEG data (such as experimental task logs, stimulus presentation
    metadata, trial sequence numbers, discrete integer codes, flatlines, or non-biological noise).
    """

    @classmethod
    def evaluate(
        cls,
        data: np.ndarray,
        sampling_rate: Optional[float] = None,
        channel_names: Optional[List[str]] = None,
        filename: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> BioAuthResult:
        """
        Execute comprehensive multi-tier bio-signal authentication.
        """
        metadata = metadata or {}
        fs = float(sampling_rate) if sampling_rate and sampling_rate > 0 else TARGET_FS
        file_stem = Path(filename).stem.lower() if filename else ""

        # Tier 0A: Direct Metadata & Filename Heuristics
        # Check if file name itself or archive context is an experimental task sequence
        if metadata.get("is_task_metadata") or metadata.get("detected_schema") == "task_metadata":
            reason = (
                "File contains experimental task metadata (stimulus presentation logs / trial sequences), "
                "not continuous electrophysiological EEG brainwave oscillations."
            )
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Task Metadata / Trial Sequence",
                rejection_reason=reason,
                confidence_score=0.99,
                details={"stage": "schema_metadata"}
            )

        if file_stem and any(
            kw in file_stem for kw in ["trial_sequence", "trialsequence", "trial_seq", "stimulus_log", "task_log", "stim_events"]
        ):
            reason = (
                f"File '{filename}' is identified as experimental task presentation metadata ({file_stem}), "
                "not electrophysiological EEG brainwave recordings."
            )
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Task Metadata / Trial Sequence",
                rejection_reason=reason,
                confidence_score=0.98,
                details={"stage": "filename_stem", "stem": file_stem}
            )

        # Tier 0B: BCI Competition / Motor Imagery / Hand Gesture Detection
        # Detects BCI competition files (BCIC, BCICIV, motor imagery, hand/foot/finger movement gestures)
        bci_keywords = [
            "bcic", "bciciv", "bcic_iv", "bci_competition", "motor_imagery",
            "motorimagery", "hand_gesture", "handgesture", "hand_movement",
            "finger_movement", "wrist_movement", "calib_ds1", "eval_ds1",
            "prosthetic", "bci2000"
        ]
        if file_stem and any(kw in file_stem for kw in bci_keywords):
            reason = (
                f"BCI Competition / Motor Imagery dataset detected ('{file_stem}'). "
                "This recording contains motor cortex hand/finger gesture imagery signals from BCI competition paradigms, "
                "not clinical 10-20 EEG for ADHD neurodevelopmental evaluation."
            )
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="BCI Motor Imagery / Hand Gesture",
                rejection_reason=reason,
                confidence_score=0.99,
                details={"stage": "bci_motor_imagery_check", "stem": file_stem}
            )

        # Tier 1: Data Integrity & Dimension Check
        if data is None or not isinstance(data, np.ndarray) or data.size == 0:
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Empty / Invalid Data",
                rejection_reason="No numeric signal data could be extracted from the file.",
                confidence_score=1.0
            )

        # Ensure 2D (time_samples, channels)
        if data.ndim == 1:
            data_2d = data[:, None]
        elif data.ndim == 2:
            # If channels > samples, orient to (samples, channels)
            if data.shape[0] < data.shape[1] and data.shape[0] <= 64:
                data_2d = data.T
            else:
                data_2d = data
        else:
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Invalid Dimension",
                rejection_reason=f"Data array must be 2D; received {data.ndim}D tensor.",
                confidence_score=1.0
            )

        samples, channels = data_2d.shape

        # Replace NaNs / Infs for numeric stability in metric computation
        if not np.all(np.isfinite(data_2d)):
            finite_mask = np.isfinite(data_2d)
            if finite_mask.sum() == 0:
                return BioAuthResult(
                    is_valid_eeg=False,
                    signal_type="Non-Finite Data",
                    rejection_reason="Signal contains entirely NaN or infinite non-numeric values.",
                    confidence_score=1.0
                )
            data_clean = np.nan_to_num(data_2d, nan=0.0, posinf=0.0, neginf=0.0)
        else:
            data_clean = data_2d

        # Tier 2: Channel Headers vs Task Metadata Headers
        if channel_names and len(channel_names) > 0:
            cleaned_names = [str(ch).strip().lower() for ch in channel_names]
            matching_task_headers = [
                ch for ch in cleaned_names
                if ch in TASK_METADATA_KEYWORDS or any(kw in ch for kw in ["trial", "stim", "reaction", "resp", "block"])
            ]
            matching_eeg_headers = [
                ch for ch in cleaned_names
                if any(eeg_name in ch for eeg_name in STANDARD_EEG_NAMES)
            ]

            # If task headers dominate or no EEG headers exist and task headers are found
            if len(matching_task_headers) > 0 and len(matching_eeg_headers) == 0:
                reason = (
                    f"File headers contain experimental task variables ({matching_task_headers[:5]}) "
                    "rather than standard EEG electrode channels (e.g. Fp1, Fp2, Cz, Pz)."
                )
                return BioAuthResult(
                    is_valid_eeg=False,
                    signal_type="Task Metadata / Trial Sequence",
                    rejection_reason=reason,
                    confidence_score=0.99,
                    details={"task_headers": matching_task_headers}
                )

        # Tier 3: Minimum Recording Duration & Sample Size
        # Genuine clinical EEG requires continuous electrophysiological oscillations.
        # A 52-row trial presentation table (0.4s at 128 Hz) is an experimental sequence log.
        min_samples_threshold = 256
        duration_sec = samples / fs if fs > 0 else 0.0

        if samples < min_samples_threshold:
            reason = (
                f"Insufficient recording sample length ({samples} samples, {duration_sec:.2f}s). "
                f"Continuous clinical EEG analysis requires at least 2.5 seconds of brainwave signals (>= {min_samples_threshold} samples). "
                "Discrete experimental trial rows (< 256 samples) cannot be evaluated as EEG signals."
            )
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Task Metadata / Short Trial Log",
                rejection_reason=reason,
                confidence_score=0.95,
                details={"samples": samples, "duration_sec": round(duration_sec, 2)}
            )

        # Tier 4: Flatline & Amplitude Scale Check
        channel_stds = np.std(data_clean, axis=0)
        channel_means = np.mean(data_clean, axis=0)

        # Flatline check (zero variance)
        if np.all(channel_stds < 1e-10):
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Flatline Signal",
                rejection_reason="Signal flatline detected: amplitude variance is zero across all channels.",
                confidence_score=1.0,
                details={"max_std": float(np.max(channel_stds))}
            )

        # Tier 5: Value Continuity vs Discrete Categorical Integers / Trial Numbers
        # Real scalp EEG potentials are continuous microvolts with high entropy.
        # Discrete integers (e.g. trial numbers 1..52, stimulus codes 101, 102, keypresses 0, 1) are NOT brainwaves.
        # Note: Genuine EEG digitized via ADC counts or stored in integer microvolts (like IEEE dataset)
        # has dozens to hundreds of distinct microvolt levels (max_unique > 30) and wide dynamic range.
        int_flags = []
        unique_counts = []
        monotonic_flags = []
        constant_diff_fractions = []

        for ch_idx in range(channels):
            col = data_clean[:, ch_idx]
            # Check integer fraction
            is_int_like = np.allclose(col, np.round(col), atol=1e-4)
            int_flags.append(is_int_like)

            # Check unique values
            n_unique = len(np.unique(np.round(col, 4)))
            unique_counts.append(n_unique)

            # Check monotonicity (e.g. sample counter: 1, 2, 3... or timestamps)
            diffs = np.diff(col)
            is_increasing = np.all(diffs >= 0) and np.any(diffs > 0)
            is_decreasing = np.all(diffs <= 0) and np.any(diffs < 0)
            monotonic_flags.append(is_increasing or is_decreasing)

            # Check fraction of constant steps (categorical blocks stay constant for many samples)
            constant_diff_fractions.append(float(np.mean(diffs == 0)))

        int_fraction = float(np.mean(int_flags))
        max_unique = max(unique_counts) if unique_counts else 0
        min_unique = min(unique_counts) if unique_counts else 0
        all_monotonic = bool(np.all(monotonic_flags))
        max_range = float(np.max(np.ptp(data_clean, axis=0)))
        max_std = float(np.max(channel_stds))
        mean_constant_frac = float(np.mean(constant_diff_fractions))

        # If data is composed of strictly monotonic counter ramps (e.g. sample indices or trial IDs)
        if all_monotonic:
            reason = (
                "Data consists of monotonic counter ramps or sequential timestamps, "
                "not oscillatory biological neural potentials."
            )
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Monotonic Counter / Timestamp Sequence",
                rejection_reason=reason,
                confidence_score=0.97,
                details={"monotonic_channels": int(np.sum(monotonic_flags))}
            )

        # If data is composed of discrete integers with few unique states (categorical trial codes)
        # We classify as discrete categorical metadata if:
        # 1. Very small discrete cardinality (max_unique <= 15, e.g. condition 1, 2, 3 or triggers 0, 1)
        # 2. Bounded low-variance integers (max_unique <= 25 and max_range <= 30 and max_std < 5.0)
        # 3. Step-wise block state variables held constant across long trial intervals (mean_constant_frac > 0.60 and max_unique <= 30)
        if int_fraction >= 0.75:
            is_categorical = False
            if max_unique <= 15:
                is_categorical = True
            elif max_unique <= 25 and max_range <= 30 and max_std < 5.0:
                is_categorical = True
            elif mean_constant_frac > 0.60 and max_unique <= 30:
                is_categorical = True

            if is_categorical:
                reason = (
                    "Discrete categorical integer codes detected (e.g. stimulus IDs, condition tags, or response keys). "
                    "Human scalp EEG consists of continuous analog microvolt voltage fluctuations."
                )
                return BioAuthResult(
                    is_valid_eeg=False,
                    signal_type="Discrete Categorical Metadata",
                    rejection_reason=reason,
                    confidence_score=0.98,
                    details={
                        "int_fraction": round(int_fraction, 2),
                        "max_unique": max_unique,
                        "max_range": round(max_range, 2)
                    }
                )


        # Astronomical amplitude check (e.g. millisecond epoch timestamps like 1.6e12 or 500,000)
        mean_abs_val = float(np.mean(np.abs(channel_means)))
        if mean_abs_val > 1e6:
            reason = (
                f"Signal amplitudes (mean magnitude {mean_abs_val:.1e}) are outside the physical range "
                "of postsynaptic scalp potentials (microvolts / millivolts)."
            )
            return BioAuthResult(
                is_valid_eeg=False,
                signal_type="Non-Biological Amplitude Scale",
                rejection_reason=reason,
                confidence_score=0.96,
                details={"mean_magnitude": mean_abs_val}
            )

        # Tier 6: Electrophysiological Spectral 1/f Signature Check
        # Real biological brainwaves follow a 1/f^alpha power-law distribution
        # with dominant power in 1–30 Hz (Delta, Theta, Alpha, Beta) relative to high-frequency noise.
        try:
            nperseg = min(256, samples)
            psd_rolloffs = []
            for ch_idx in range(min(channels, 5)):
                col = data_clean[:, ch_idx]
                freqs, psd = signal.welch(col, fs=fs, nperseg=nperseg)
                mask_low = (freqs >= 1.0) & (freqs <= 12.0)
                mask_high = (freqs >= 30.0) & (freqs <= min(45.0, fs / 2 * 0.95))

                low_power = np.mean(psd[mask_low]) if np.any(mask_low) else 1e-12
                high_power = np.mean(psd[mask_high]) if np.any(mask_high) else 1e-12
                rolloff = float(low_power / (high_power + 1e-12))
                psd_rolloffs.append(rolloff)

            mean_rolloff = float(np.mean(psd_rolloffs))

            # If high-frequency power is overwhelming (> 8x stronger than low-frequency biological bands),
            # the signal represents non-biological high-frequency noise or step impulse combs.
            if mean_rolloff < 0.10:
                reason = (
                    "Signal power spectrum lacks the characteristic 1/f electrophysiological power law. "
                    "High-frequency noise or discrete step artifacts dominate the biological frequency bands."
                )
                return BioAuthResult(
                    is_valid_eeg=False,
                    signal_type="Non-Biological Noise",
                    rejection_reason=reason,
                    confidence_score=0.92,
                    details={"spectral_rolloff": round(mean_rolloff, 3)}
                )
        except Exception:
            pass

        # Tier 7: Clinical 19-Channel 10-20 Montage Compatibility Check
        # The trained deep learning ensemble strictly operates on 19 standard 10-20 scalp leads.
        # Sparse/low-density recordings (e.g. 2-channel Mendeley) or anonymous non-10-20 arrays
        # (e.g. 59-channel motor imagery) cannot be evaluated by the 19-channel clinical model.
        from app.config import REQUIRED_CHANNELS
        from app.preprocessing.channels import ALIAS_LOOKUP, clean_channel_name

        if channel_names and len(channel_names) > 0:
            cleaned_names = [clean_channel_name(ch) for ch in channel_names]
            matched_targets = set()
            for ch in cleaned_names:
                tgt = ALIAS_LOOKUP.get(ch)
                if tgt:
                    matched_targets.add(tgt)

            if len(matched_targets) < 4:
                reason = (
                    f"Incompatible electrode montage: Found {len(channel_names)} channels, but only "
                    f"{len(matched_targets)} match the standard 19-channel 10-20 system. "
                    "The ADHD diagnostic model requires standard 10-20 scalp channels (Fp1 through O2) "
                    "to evaluate fronto-striatal and parieto-occipital neural biomarkers."
                )
                return BioAuthResult(
                    is_valid_eeg=False,
                    signal_type="Incompatible Montage (Sparse / Non-10-20)",
                    rejection_reason=reason,
                    confidence_score=0.98,
                    details={"channels": channels, "matched_10_20": len(matched_targets)}
                )
        else:
            # No channel names provided: must have at least 16 channels, or exactly 19 channels
            if channels <= 2:
                reason = (
                    f"Incompatible electrode montage: Recording contains only {channels} channels without 10-20 localization. "
                    f"The ADHD diagnostic model requires a full 19-channel 10-20 international system montage (Fp1 through O2). "
                    f"Sparse {channels}-channel recordings (such as 2-channel portable headsets) cannot be clinically evaluated for ADHD."
                )
                return BioAuthResult(
                    is_valid_eeg=False,
                    signal_type=f"Incompatible Montage (Sparse {channels}-Channel)",
                    rejection_reason=reason,
                    confidence_score=0.99,
                    details={"channels": channels, "required": REQUIRED_CHANNELS}
                )
            elif channels > REQUIRED_CHANNELS:
                reason = (
                    f"Incompatible electrode montage: Recording contains {channels} channels without standard 10-20 electrode labels. "
                    f"Arbitrary high-density arrays ({channels} channels) cannot be mapped to the 19-channel clinical model without verified channel headers."
                )
                return BioAuthResult(
                    is_valid_eeg=False,
                    signal_type=f"Incompatible Montage (High-Density {channels}-Channel)",
                    rejection_reason=reason,
                    confidence_score=0.98,
                    details={"channels": channels, "required": REQUIRED_CHANNELS}
                )

        # ALL CHECKS PASSED: Authenticated Electrophysiological EEG Brainwave Signal
        log_pipeline_step(
            "BIO_AUTH",
            f"Authenticated genuine EEG brainwave signal for '{filename or 'unknown'}': "
            f"{samples} samples, {channels} channels, duration={duration_sec:.2f}s"
        )

        return BioAuthResult(
            is_valid_eeg=True,
            signal_type="EEG Brainwave",
            confidence_score=0.99,
            details={
                "samples": samples,
                "channels": channels,
                "duration_seconds": round(duration_sec, 2),
                "sampling_rate": fs
            }
        )
