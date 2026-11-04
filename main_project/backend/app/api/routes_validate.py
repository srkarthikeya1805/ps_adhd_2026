import shutil
import tempfile
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.parsers.zip_parser import extract_zip_archive_safely
from app.schemas.responses import ValidationReport
from app.utils.files import (
    copy_upload_with_limit,
    safe_upload_filename,
    validate_extension,
)
from app.validation.validator import validate_eeg_file

router = APIRouter(prefix="/api", tags=["Validation"])


@router.post("/validate", response_model=List[ValidationReport])
async def validate_eeg_files_endpoint(
    files: List[UploadFile] = File(...),
    sampling_rate: Optional[float] = Form(None)
):
    """
    Validate uploaded EEG file(s) or ZIP archive without running neural network inference.
    Inspects shape, sampling rate, channels, duration, and pipeline compatibility.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded for validation.")

    temp_dir = Path(tempfile.mkdtemp(prefix="adhd_val_"))
    reports: List[ValidationReport] = []

    valid_fs: Optional[float] = None
    if sampling_rate is not None:
        try:
            fs_val = float(sampling_rate)
            if fs_val > 0.0:
                valid_fs = fs_val
        except (ValueError, TypeError):
            valid_fs = None

    try:
        # Check if single ZIP uploaded
        if len(files) == 1 and safe_upload_filename(files[0].filename).lower().endswith(".zip"):
            upload = files[0]
            archive_name = safe_upload_filename(upload.filename)
            archive_path = temp_dir / archive_name
            copy_upload_with_limit(upload, archive_path)

            extract_path = temp_dir / "extracted"
            extract_path.mkdir(parents=True, exist_ok=True)
            eeg_files, _ = extract_zip_archive_safely(archive_path, extract_path)

            if not eeg_files:
                raise ValueError("No supported EEG recordings found in the ZIP archive.")

            for path in eeg_files:
                rel_name = str(path.relative_to(extract_path))
                report = validate_eeg_file(path, sampling_rate_override=valid_fs)
                report.file = rel_name
                reports.append(report)

        else:
            for idx, upload in enumerate(files):
                safe_name = safe_upload_filename(upload.filename)
                validate_extension(safe_name)
                dest = temp_dir / f"{idx}_{safe_name}"
                copy_upload_with_limit(upload, dest)

                report = validate_eeg_file(dest, sampling_rate_override=valid_fs)
                report.file = safe_name
                reports.append(report)

        return reports

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Validation error: {exc}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
