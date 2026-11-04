import shutil
import tempfile
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.parsers import extract_channel_names_from_companion_file
from app.parsers.zip_parser import METADATA_EXACT_STEMS
from app.schemas.responses import (
    BatchPredictionResponse,
    FilePredictionResult,
)
from app.subagents.dispatcher import DispatcherSubagent
from app.subagents.reporter import ReporterSubagent
from app.utils.files import (
    copy_upload_with_limit,
    safe_upload_filename,
    validate_extension,
)
from app.utils.logging import log_pipeline_step

router = APIRouter(tags=["Prediction"])


def discover_companion_channels(files: List[Path]) -> Optional[List[str]]:
    """Inspect companion files in the archive to discover electrode channel names."""
    return DispatcherSubagent.discover_companion_channels(files)


def predict_single_eeg_file(
    path: Path,
    display_name: str,
    sampling_rate_override: Optional[float] = None,
    fallback_channel_names: Optional[List[str]] = None
) -> FilePredictionResult:
    """
    Process one EEG file through the subagent pipeline:
    Format Inspector -> Bio-Signal Authenticator -> Preprocessor -> Hybrid Ensemble -> Reporter
    """
    return DispatcherSubagent.process_file(
        path=path,
        display_name=display_name,
        sampling_rate_override=sampling_rate_override,
        fallback_channel_names=fallback_channel_names
    )


def build_batch_response(
    results: List[FilePredictionResult],
    batch_type: str,
    archive_name: Optional[str] = None
) -> BatchPredictionResponse:
    """Aggregate individual file prediction results into a summary response."""
    return ReporterSubagent.aggregate_batch(
        results=results,
        batch_type=batch_type,
        archive_name=archive_name
    )


@router.post("/api/predict", response_model=BatchPredictionResponse)
@router.post("/api/predict/batch", response_model=BatchPredictionResponse)
@router.post("/predict-adhd")
async def predict_eeg_endpoint(
    files: List[UploadFile] = File(...),
    sampling_rate: Optional[float] = Form(None)
):
    """
    Predict ADHD vs Control on one or more uploaded EEG recordings (or a ZIP archive).
    Accepts .mat, .csv, .tsv, .txt, .npy, .npz, .edf, .fif, .set, and .zip files.
    Non-EEG inputs (task metadata, stimulus logs, trial sequences, non-biological signals)
    are authenticated and cleanly rejected without invalid model predictions.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No EEG files were uploaded.")

    temp_dir = Path(tempfile.mkdtemp(prefix="adhd_pred_"))

    try:
        # Sanitize sampling_rate override: ignore 0 or negative values
        valid_fs: Optional[float] = None
        if sampling_rate is not None:
            try:
                fs_val = float(sampling_rate)
                if fs_val > 0.0:
                    valid_fs = fs_val
            except (ValueError, TypeError):
                valid_fs = None

        # CASE 1: Single ZIP archive upload
        if len(files) == 1 and safe_upload_filename(files[0].filename).lower().endswith(".zip"):
            upload = files[0]
            archive_name = safe_upload_filename(upload.filename)
            archive_path = temp_dir / archive_name
            copy_upload_with_limit(upload, archive_path)

            extract_path = temp_dir / "extracted_dataset"
            extract_path.mkdir(parents=True, exist_ok=True)

            # Dispatch via DispatcherSubagent with high-speed parallel workers
            return DispatcherSubagent.process_zip_archive(
                archive_path=archive_path,
                extract_dir=extract_path,
                sampling_rate_override=valid_fs
            )

        # CASE 2: Multiple (or single) individual EEG files
        # Check if any uploaded files are companion metadata files
        companion_channels: Optional[List[str]] = None
        if len(files) > 1:
            for upload in files:
                safe_name = safe_upload_filename(upload.filename)
                stem = Path(safe_name).stem.lower()
                if stem in METADATA_EXACT_STEMS:
                    stored_meta = temp_dir / f"meta_{safe_name}"
                    copy_upload_with_limit(upload, stored_meta)
                    companion_channels = extract_channel_names_from_companion_file(stored_meta)
                    if companion_channels:
                        break

        files_with_names = []
        for idx, upload in enumerate(files):
            safe_name = safe_upload_filename(upload.filename)
            stem = Path(safe_name).stem.lower()
            if len(files) > 1 and stem in METADATA_EXACT_STEMS:
                continue

            validate_extension(safe_name)
            stored_path = temp_dir / f"{idx}_{safe_name}"
            copy_upload_with_limit(upload, stored_path)
            files_with_names.append((stored_path, safe_name))

        if not files_with_names:
            raise ValueError("No supported EEG recordings found in the upload.")

        # Process in parallel using DispatcherSubagent worker pool
        results = DispatcherSubagent.process_batch(
            files_with_names=files_with_names,
            sampling_rate_override=valid_fs,
            fallback_channel_names=companion_channels
        )

        batch_type = "single_file" if len(results) == 1 else "multiple_files"
        return ReporterSubagent.aggregate_batch(results, batch_type=batch_type)

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Processing error: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Backend error: {exc}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

