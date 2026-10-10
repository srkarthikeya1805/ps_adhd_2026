import shutil
import tempfile
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.model.inference import run_inference
from app.parsers import (
    extract_channel_names_from_companion_file,
    parse_eeg_file,
)
from app.parsers.zip_parser import METADATA_EXACT_STEMS, extract_zip_archive_safely
from app.preprocessing import process_eeg_recording
from app.schemas.responses import (
    BatchPredictionResponse,
    BatchSummary,
    FilePredictionDetails,
    FilePredictionResult,
    WindowPrediction,
)
from app.utils.files import (
    copy_upload_with_limit,
    infer_folder_label,
    safe_upload_filename,
    validate_extension,
)
from app.utils.logging import log_pipeline_step
from app.validation.compatibility import check_tensor_compatibility

router = APIRouter(tags=["Prediction"])


def discover_companion_channels(files: List[Path]) -> Optional[List[str]]:
    """Inspect companion files in the archive to discover electrode channel names."""
    for path in files:
        stem = path.stem.lower()
        if stem in METADATA_EXACT_STEMS or any(k in stem for k in ["chan", "electrode", "montage"]):
            try:
                ch_names = extract_channel_names_from_companion_file(path)
                if ch_names:
                    log_pipeline_step(
                        "METADATA",
                        f"Discovered {len(ch_names)} channel names from companion metadata file '{path.name}'."
                    )
                    return ch_names
            except Exception:
                pass
    return None


def predict_single_eeg_file(
    path: Path,
    display_name: str,
    sampling_rate_override: Optional[float] = None,
    fallback_channel_names: Optional[List[str]] = None
) -> FilePredictionResult:
    """
    Process one EEG file through the entire pipeline:
    Parse -> Orient -> Resample -> Filter -> Normalize -> Window -> CNN-Transformer -> Aggregate
    """
    try:
        # 1. Universal Parse
        recording = parse_eeg_file(
            path,
            sampling_rate_override=sampling_rate_override,
            fallback_channel_names=fallback_channel_names
        )
        original_shape = list(recording.original_shape)
        orig_fs = recording.sampling_rate


        # 2. Universal Preprocess
        X, continuous_preprocessed, final_fs, channel_names, warnings = process_eeg_recording(recording)

        # 3. Model compatibility check
        check_tensor_compatibility(X)

        # 4. Neural Network Inference
        mean_prob, pred_class, window_probs, window_records, agg_metrics = run_inference(X)

        orig_sample_count = recording.original_shape[0] if (len(recording.original_shape) >= 1 and recording.original_shape[0] > 1) else len(recording.data)
        duration_sec = round(orig_sample_count / (orig_fs or final_fs), 2)

        # 5. Build detailed result
        details = FilePredictionDetails(
            source=recording.source_format,
            format=path.suffix.lower(),
            sampling_rate_original=orig_fs,
            sampling_rate_used=final_fs,
            resampled=abs(float(orig_fs or final_fs) - final_fs) > 1e-4,
            original_shape=original_shape,
            preprocessed_shape=list(continuous_preprocessed.shape),
            channels_original=recording.original_shape[1] if len(recording.original_shape) == 2 else 19,
            channels_used=19,
            channel_names=channel_names,
            duration_seconds=duration_sec,
            window_seconds=10,
            window_samples=1280,
            overlap=0.50,
            windows=len(X),
            warnings=warnings,
            window_probabilities=window_probs,
            window_predictions=[WindowPrediction(**w) for w in window_records]
        )

        folder_ctx = infer_folder_label(display_name)

        return FilePredictionResult(
            filename=display_name,
            status="success",
            prediction=pred_class,
            adhd_probability=round(mean_prob, 6),
            confidence=agg_metrics["confidence"],
            mean_adhd_probability=agg_metrics["mean_adhd_probability"],
            median_adhd_probability=agg_metrics["median_adhd_probability"],
            adhd_window_percentage=agg_metrics["adhd_window_percentage"],
            total_windows=len(X),
            folder_context=folder_ctx,
            error=None,
            details=details
        )

    except Exception as exc:
        return FilePredictionResult(
            filename=display_name,
            status="failed",
            error=str(exc),
            folder_context=infer_folder_label(display_name)
        )


def build_batch_response(
    results: List[FilePredictionResult],
    batch_type: str,
    archive_name: Optional[str] = None
) -> BatchPredictionResponse:
    """Aggregate individual file prediction results into a summary response."""
    successful = [r for r in results if r.status == "success"]
    failed = [r for r in results if r.status == "failed"]

    adhd_count = sum(1 for r in successful if r.prediction == "ADHD")
    control_count = sum(1 for r in successful if r.prediction == "Control")

    summary = BatchSummary(
        total_files=len(results),
        successful_files=len(successful),
        failed_files=len(failed),
        adhd_predictions=adhd_count,
        control_predictions=control_count
    )

    overall_status = "success" if len(successful) > 0 else "failed"

    return BatchPredictionResponse(
        batch_type=batch_type,
        archive_name=archive_name,
        summary=summary,
        results=results,
        status=overall_status
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
            eeg_files, ignored_files = extract_zip_archive_safely(archive_path, extract_path)

            if not eeg_files:
                raise ValueError("No supported EEG recordings found in the ZIP archive.")

            companion_channels = discover_companion_channels(ignored_files)

            results: List[FilePredictionResult] = []
            for path in eeg_files:
                relative_name = str(path.relative_to(extract_path))
                res = predict_single_eeg_file(
                    path,
                    relative_name,
                    sampling_rate_override=valid_fs,
                    fallback_channel_names=companion_channels
                )
                results.append(res)

            return build_batch_response(results, batch_type="zip_archive", archive_name=archive_name)

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

        results: List[FilePredictionResult] = []
        for idx, upload in enumerate(files):
            safe_name = safe_upload_filename(upload.filename)
            stem = Path(safe_name).stem.lower()
            if len(files) > 1 and stem in METADATA_EXACT_STEMS:
                continue

            validate_extension(safe_name)
            stored_path = temp_dir / f"{idx}_{safe_name}"
            copy_upload_with_limit(upload, stored_path)

            res = predict_single_eeg_file(
                stored_path,
                safe_name,
                sampling_rate_override=valid_fs,
                fallback_channel_names=companion_channels
            )
            results.append(res)

        if not results:
            raise ValueError("No supported EEG recordings found in the upload.")

        batch_type = "single_file" if len(results) == 1 else "multiple_files"
        return build_batch_response(results, batch_type=batch_type)

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Processing error: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Backend error: {exc}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
