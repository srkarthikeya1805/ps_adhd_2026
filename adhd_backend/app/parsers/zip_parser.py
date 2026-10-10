import shutil
import zipfile
from pathlib import Path
from typing import List, Tuple

from app.config import (
    MAX_ZIP_FILES,
    MAX_ZIP_UNCOMPRESSED_BYTES,
    SUPPORTED_EXTENSIONS,
)
from app.utils.logging import log_pipeline_step


# Exact stems that indicate metadata or channel montage / locations files (e.g. chan.mat, chanlocs.mat, y_stim.mat)
METADATA_EXACT_STEMS = {
    "chan", "chans", "chanloc", "chanlocs", "channel", "channels",
    "elec", "elecs", "electrode", "electrodes", "sensor", "sensors",
    "montage", "montages", "layout", "coords", "coordinates", "locs", "cap",
    "sub_name_stim", "y_stim", "sub_names", "sub_name", "subject_names",
    "events", "event", "triggers", "trigger", "markers", "marker",
    "stim", "stimuli", "stim_events"
}

# Keywords that indicate non-signal documentation or metadata files
METADATA_FILENAME_KEYWORDS = {
    "metadata", "participant", "participants", "subject", "subjects",
    "label", "labels", "demographic", "demographics", "clinical",
    "readme", "channel_labels", "summary", "standard", "info", "description",
    "event", "events"
}


def extract_zip_archive_safely(
    archive_path: Path,
    destination_dir: Path
) -> Tuple[List[Path], List[Path]]:
    """
    Safely extract a ZIP archive protecting against zip-slip and bomb attacks.

    Parameters:
        archive_path: Path to the .zip file
        destination_dir: Directory where files should be extracted

    Returns:
        eeg_files: List of paths to supported EEG files found
        ignored_files: List of paths to ignored unsupported files
    """
    destination_resolved = destination_dir.resolve()

    with zipfile.ZipFile(archive_path, "r") as archive:
        members = [m for m in archive.infolist() if not m.is_dir()]

        # File count limit check
        if len(members) > MAX_ZIP_FILES:
            raise ValueError(
                f"ZIP archive contains {len(members):,} files, exceeding limit of {MAX_ZIP_FILES:,}."
            )

        # Uncompressed byte size limit check
        total_size = sum(max(0, m.file_size) for m in members)
        if total_size > MAX_ZIP_UNCOMPRESSED_BYTES:
            limit_gb = MAX_ZIP_UNCOMPRESSED_BYTES // (1024 ** 3)
            raise ValueError(
                f"ZIP uncompressed size ({total_size / (1024**3):.2f} GB) exceeds safety limit of {limit_gb} GB."
            )

        # Extraction with path traversal verification
        for member in members:
            member_path = Path(member.filename)

            if member_path.is_absolute():
                raise ValueError("ZIP archive contains an illegal absolute file path.")

            if ".." in member_path.parts:
                raise ValueError("ZIP archive contains an illegal directory traversal path.")

            target = (destination_dir / member_path).resolve()
            if not target.is_relative_to(destination_resolved):
                raise ValueError("ZIP archive contains path targeting outside the extraction directory.")

            # Reject unix symlinks
            mode = member.external_attr >> 16
            if mode & 0o170000 == 0o120000:
                raise ValueError("ZIP archive contains unsupported symbolic links.")

            target.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(member) as src, open(target, "wb") as dst:
                shutil.copyfileobj(src, dst)

    # Search for supported and unsupported files recursively
    eeg_files: List[Path] = []
    ignored_files: List[Path] = []

    for path in sorted(destination_dir.rglob("*")):
        if path.is_file():
            stem_lower = path.stem.lower()
            ext_lower = path.suffix.lower()

            # Check if file is a companion channel/metadata file
            is_metadata_file = (
                stem_lower in METADATA_EXACT_STEMS
                or stem_lower.startswith("y_")
                or stem_lower.endswith("_stim")
                or stem_lower.endswith("_meta")
                or stem_lower.endswith("_events")
                or stem_lower.endswith("_layout")
                or stem_lower.endswith("_montage")
                or any(stem_lower.startswith(f"{stem}_") or stem_lower.endswith(f"_{stem}") for stem in METADATA_EXACT_STEMS)
            )
            if not is_metadata_file and ext_lower not in {".mat", ".edf", ".gdf", ".bdf", ".npy", ".npz"}:
                # Text/table formats (.csv, .tsv, .txt)
                is_metadata_file = any(kw in stem_lower for kw in METADATA_FILENAME_KEYWORDS)

            if ext_lower in SUPPORTED_EXTENSIONS and not is_metadata_file:
                eeg_files.append(path)
            else:
                ignored_files.append(path)

    log_pipeline_step(
        "ZIP",
        f"Extracted archive: found {len(eeg_files)} supported EEG recordings and "
        f"{len(ignored_files)} ignored non-EEG files."
    )

    return eeg_files, ignored_files

