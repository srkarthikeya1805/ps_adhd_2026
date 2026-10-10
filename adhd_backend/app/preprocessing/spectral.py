"""
Spectral profiling module for universal EEG normalization.
Computes Individual Alpha Frequency (IAF) and Theta/Beta Ratio (TBR)
to adaptively account for developmental (child vs adult) spectral variations.
"""

from typing import Dict, Tuple
import numpy as np
from scipy import signal

from app.config import TARGET_FS
from app.utils.logging import log_pipeline_step


def compute_spectral_profile(
    data: np.ndarray,
    fs: float = TARGET_FS
) -> Dict[str, float]:
    """
    Analyze spectral features across the 19 standard channels:
    - Individual Alpha Peak Frequency (IAF in 7-13 Hz)
    - Frontal Theta/Beta Ratio (TBR)
    - Normalized spectral age compensation factor

    Parameters:
        data: np.ndarray of shape (time_samples, channels)
        fs: sampling rate in Hz (default 128 Hz)

    Returns:
        profile: Dict containing IAF, TBR, age_profile ('pediatric' or 'adult'),
                 and spectral_offset
    """
    if len(data) < 256 or data.ndim != 2:
        return {
            "iaf_hz": 10.0,
            "tbr": 2.0,
            "profile": "adult",
            "spectral_offset": 0.0
        }

    # Welch PSD across time axis
    freqs, psd = signal.welch(data, fs=fs, nperseg=min(256, len(data)), axis=0)

    # 1. Individual Alpha Frequency (posterior channels or average across channels)
    alpha_mask = (freqs >= 7.0) & (freqs <= 13.0)
    if np.any(alpha_mask):
        mean_psd_alpha = np.mean(psd[alpha_mask, :], axis=1)
        peak_idx = np.argmax(mean_psd_alpha)
        iaf = float(freqs[alpha_mask][peak_idx])
    else:
        iaf = 10.0

    # 2. Frontal Theta (4-8 Hz) and Beta (13-30 Hz) power
    theta_mask = (freqs >= 4.0) & (freqs < 8.0)
    beta_mask = (freqs >= 13.0) & (freqs <= 30.0)

    theta_power = float(np.mean(psd[theta_mask, :])) if np.any(theta_mask) else 1e-6
    beta_power = float(np.mean(psd[beta_mask, :])) if np.any(beta_mask) else 1e-6
    tbr = float(theta_power / max(beta_power, 1e-8))

    # Developmental classification:
    # Children have lower IAF (< 9.5 Hz) and elevated baseline TBR (> 2.5)
    # Adults have higher IAF (~10-11.5 Hz) and lower baseline TBR (~1.2-1.8)
    if iaf < 9.5 or tbr > 2.6:
        profile_type = "pediatric"
        # Normal baseline for pediatric visual attention
        spectral_offset = 0.0
    else:
        profile_type = "adult"
        # In adults during cognitive load tasks (Stroop, Flanker), frontal theta naturally increases
        # Compensate for adult conflict-induced theta so it is not misdiagnosed as pediatric ADHD
        spectral_offset = -0.05 if tbr > 1.8 else 0.0

    log_pipeline_step(
        "SPECTRAL",
        f"Spectral Profile: IAF={iaf:.1f} Hz, TBR={tbr:.2f}, Cohort Profile={profile_type}"
    )

    return {
        "iaf_hz": round(iaf, 2),
        "tbr": round(tbr, 4),
        "profile": profile_type,
        "spectral_offset": spectral_offset
    }
