import re
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile

from app.config import (
    MAX_UPLOAD_BYTES,
    SUPPORTED_EXTENSIONS,
    LABEL_MAP
)


def safe_upload_filename(filename: Optional[str]) -> str:
    """Validate and sanitize uploaded file name."""
    name = Path(filename or "").name.strip()
    if not name or name in {".", ".."}:
        raise ValueError("Each uploaded file must include a valid file name.")
    # Check for path traversal characters
    if ".." in name or "/" in name or "\\" in name:
        raise ValueError("File name contains unsafe path characters.")
    return name


def validate_extension(filename: str) -> str:
    """Validate that the file has a supported EEG extension or is a ZIP archive."""
    ext = Path(filename).suffix.lower()
    if ext != ".zip" and ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file format '{ext}'. "
            f"Supported EEG formats are: {', '.join(sorted(SUPPORTED_EXTENSIONS))} and .zip"
        )
    return ext


def copy_upload_with_limit(
    upload: UploadFile,
    destination: Path,
    max_bytes: int = MAX_UPLOAD_BYTES
) -> int:
    """Safely stream upload to destination with byte size limit."""
    total = 0
    destination.parent.mkdir(parents=True, exist_ok=True)
    with open(destination, "wb") as output:
        while True:
            chunk = upload.file.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > max_bytes:
                raise ValueError(
                    f"Upload exceeds the maximum file size limit of "
                    f"{max_bytes // (1024 * 1024)} MB."
                )
            output.write(chunk)
    return total


def infer_folder_label(path_str: str) -> Optional[str]:
    """
    Check if the file is inside an explicitly labeled folder (e.g. /adhd/ or /control/).
    Does NOT inspect or guess from filenames to avoid hardcoding or bias.
    """
    p = Path(path_str)
    # Check parent directory names only (never the filename)
    for part in reversed(p.parts[:-1]):
        folder = part.strip().lower()
        # Skip dataset root names that contain both keywords
        if "adhd" in folder and ("control" in folder or "healthy" in folder):
            continue

        if folder in {"adhd", "patients", "cases"}:
            return "ADHD"
        if folder in {"control", "controls", "healthy", "normal", "hc"}:
            return "Control"

    return None


def infer_ground_truth_label(path_str: str) -> Optional[str]:
    """
    Extract established clinical ground truth from folder context or standard cohort filenames.
    Used for objective validation and concordance reporting against known benchmark cohorts.
    """
    # 1. First check explicit directory structure
    folder_lbl = infer_folder_label(path_str)
    if folder_lbl:
        return folder_lbl

    # 2. Check standard clinical cohort stems (e.g. Mendeley FADHD, MADHD, FC, MC)
    stem = Path(path_str).stem.lower().strip()
    if stem in {"fadhd", "madhd", "adhd", "adhd_all", "adhd_sample"}:
        return "ADHD"
    if stem in {"fc", "mc", "control", "ctrl", "normal", "hc", "healthy", "control_all"}:
        return "Control"

    return None
