from pathlib import Path
from typing import Dict, List, Set

# Base directories
BASE_DIR: Path = Path(__file__).resolve().parent.parent
MODELS_DIR: Path = BASE_DIR / "models"

# Model paths (prefer adhd_cnn_transformer_model.keras, fallback to model.keras)
PRIMARY_MODEL_PATH: Path = MODELS_DIR / "adhd_cnn_transformer_model.keras"
FALLBACK_MODEL_PATH: Path = MODELS_DIR / "model.keras"


def get_model_path() -> Path:
    if PRIMARY_MODEL_PATH.exists():
        return PRIMARY_MODEL_PATH
    if FALLBACK_MODEL_PATH.exists():
        return FALLBACK_MODEL_PATH
    raise FileNotFoundError(
        f"Trained model not found in {MODELS_DIR}. "
        f"Expected '{PRIMARY_MODEL_PATH.name}' or '{FALLBACK_MODEL_PATH.name}'."
    )


# EEG Signal Processing Configuration
TARGET_FS: float = 128.0
LOWCUT: float = 1.0
HIGHCUT: float = 45.0
NOTCH_HZ: float = 50.0

# Windowing Configuration
WINDOW_SECONDS: int = 10
WINDOW_SAMPLES: int = int(WINDOW_SECONDS * TARGET_FS)  # 1280
OVERLAP: float = 0.50
STRIDE_SAMPLES: int = int(WINDOW_SAMPLES * (1 - OVERLAP))  # 640

# Channels Configuration
REQUIRED_CHANNELS: int = 19
MODEL_CHANNEL_NAMES: List[str] = [
    "Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",
    "T3", "C3", "Cz", "C4", "T4", "T5", "P3",
    "Pz", "P4", "T6", "O1", "O2"
]

# Standard 10-20 channel aliases
CHANNEL_ALIASES: Dict[str, List[str]] = {
    "FP1": ["FP1", "FP-1", "FP 1", "EEG FP1", "EEGFP1", "FP1-REF", "FP1-LE"],
    "FP2": ["FP2", "FP-2", "FP 2", "EEG FP2", "EEGFP2", "FP2-REF", "FP2-LE"],
    "F7":  ["F7", "F-7", "EEG F7", "EEGF7", "F7-REF", "F7-LE"],
    "F3":  ["F3", "F-3", "EEG F3", "EEGF3", "F3-REF", "F3-LE"],
    "FZ":  ["FZ", "F-Z", "EEG FZ", "EEGFZ", "FZ-REF", "FZ-LE"],
    "F4":  ["F4", "F-4", "EEG F4", "EEGF4", "F4-REF", "F4-LE"],
    "F8":  ["F8", "F-8", "EEG F8", "EEGF8", "F8-REF", "F8-LE"],
    "T3":  ["T3", "T-3", "T7", "T-7", "EEG T3", "EEGT3", "EEG T7", "EEGT7", "T3-REF", "T7-REF"],
    "C3":  ["C3", "C-3", "EEG C3", "EEGC3", "C3-REF", "C3-LE"],
    "CZ":  ["CZ", "C-Z", "EEG CZ", "EEGCZ", "CZ-REF", "CZ-LE"],
    "C4":  ["C4", "C-4", "EEG C4", "EEGC4", "C4-REF", "C4-LE"],
    "T4":  ["T4", "T-4", "T8", "T-8", "EEG T4", "EEGT4", "EEG T8", "EEGT8", "T4-REF", "T8-REF"],
    "T5":  ["T5", "T-5", "P7", "P-7", "EEG T5", "EEGT5", "EEG P7", "EEGP7", "T5-REF", "P7-REF"],
    "P3":  ["P3", "P-3", "EEG P3", "EEGP3", "P3-REF", "P3-LE"],
    "PZ":  ["PZ", "P-Z", "EEG PZ", "EEGPZ", "PZ-REF", "PZ-LE"],
    "P4":  ["P4", "P-4", "EEG P4", "EEGP4", "P4-REF", "P4-LE"],
    "T6":  ["T6", "T-6", "P8", "P-8", "EEG T6", "EEGT6", "EEG P8", "EEGP8", "T6-REF", "P8-REF"],
    "O1":  ["O1", "O-1", "EEG O1", "EEGO1", "O1-REF", "O1-LE"],
    "O2":  ["O2", "O-2", "EEG O2", "EEGO2", "O2-REF", "O2-LE"],
}

# Label & Class Mapping
LABEL_MAP: Dict[str, int] = {
    "adhd": 1,
    "control": 0,
    "healthy": 0,
    "hc": 0,
    "normal": 0,
    "nonadhd": 0,
    "non-adhd": 0
}

CLASS_NAMES: Dict[int, str] = {
    0: "Control",
    1: "ADHD"
}

# File Upload Limits
MAX_UPLOAD_BYTES: int = 4 * 1024 * 1024 * 1024        # 4 GB (4096 MB)
MAX_ZIP_UNCOMPRESSED_BYTES: int = 8 * 1024 * 1024 * 1024  # 8 GB
MAX_ZIP_FILES: int = 50_000

# Supported EEG extensions
SUPPORTED_EXTENSIONS: Set[str] = {
    ".mat",
    ".csv",
    ".tsv",
    ".npy",
    ".npz",
    ".edf",
    ".gdf",
    ".bdf",
    ".fif",
    ".set"
}

