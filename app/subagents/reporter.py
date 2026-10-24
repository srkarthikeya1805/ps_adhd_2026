from typing import Any, Dict, List, Optional
import numpy as np

from app.schemas.responses import (
    BatchPredictionResponse,
    BatchSummary,
    FilePredictionDetails,
    FilePredictionResult,
    WindowPrediction,
)
from app.subagents.bio_authenticator import BioAuthResult
from app.utils.files import infer_folder_label, infer_ground_truth_label


class ReporterSubagent:
    """
    Subagent responsible for clinical diagnostic report generation and batch aggregation.
    """

    @classmethod
    def format_invalid_signal(
        cls,
        display_name: str,
        auth_result: BioAuthResult
    ) -> FilePredictionResult:
        """
        Create a clear rejection result for non-EEG files or experimental task logs.
        """
        folder_ctx = infer_folder_label(display_name)
        ground_truth = infer_ground_truth_label(display_name)

        return FilePredictionResult(
            filename=display_name,
            status="invalid_input",
            is_valid_eeg=False,
            signal_type=auth_result.signal_type,
            rejection_reason=auth_result.rejection_reason,
            prediction=None,
            adhd_probability=None,
            confidence=None,
            mean_adhd_probability=None,
            median_adhd_probability=None,
            adhd_window_percentage=None,
            total_windows=0,
            folder_context=folder_ctx,
            ground_truth_label=ground_truth,
            concordance=None,
            error=auth_result.rejection_reason,
            details=None
        )

    @classmethod
    def format_success(
        cls,
        display_name: str,
        recording: Any,
        continuous_preprocessed: np.ndarray,
        final_fs: float,
        channel_names: List[str],
        warnings: List[str],
        num_windows: int,
        mean_prob: float,
        pred_class: str,
        window_probs: List[float],
        window_records: List[Dict[str, Any]],
        agg_metrics: Dict[str, Any],
        path_suffix: str
    ) -> FilePredictionResult:
        """
        Create a detailed success result for authenticated EEG recordings.
        """
        orig_shape = list(recording.original_shape)
        orig_fs = recording.sampling_rate
        orig_sample_count = (
            orig_shape[0] if (len(orig_shape) >= 1 and orig_shape[0] > 1) else len(recording.data)
        )
        duration_sec = round(orig_sample_count / (orig_fs or final_fs), 2)

        details = FilePredictionDetails(
            source=recording.source_format,
            format=path_suffix.lower(),
            sampling_rate_original=orig_fs,
            sampling_rate_used=final_fs,
            resampled=abs(float(orig_fs or final_fs) - final_fs) > 1e-4,
            original_shape=orig_shape,
            preprocessed_shape=list(continuous_preprocessed.shape),
            channels_original=orig_shape[1] if len(orig_shape) == 2 else 19,
            channels_used=19,
            channel_names=channel_names,
            duration_seconds=duration_sec,
            window_seconds=10,
            window_samples=1280,
            overlap=0.50,
            windows=num_windows,
            warnings=warnings,
            window_probabilities=window_probs,
            window_predictions=[WindowPrediction(**w) for w in window_records],
            model_probabilities=agg_metrics.get("model_probabilities"),
            ensemble_weights=agg_metrics.get("ensemble_weights"),
            threshold=agg_metrics.get("threshold"),
        )

        folder_ctx = infer_folder_label(display_name)
        ground_truth = infer_ground_truth_label(display_name)
        concordance_status = None
        if ground_truth and pred_class:
            concordance_status = "Concordant" if ground_truth.upper() == pred_class.upper() else "Discordant"

        return FilePredictionResult(
            filename=display_name,
            status="success",
            is_valid_eeg=True,
            signal_type="EEG Brainwave",
            prediction=pred_class,
            adhd_probability=round(mean_prob, 6),
            confidence=agg_metrics["confidence"],
            mean_adhd_probability=agg_metrics["mean_adhd_probability"],
            median_adhd_probability=agg_metrics["median_adhd_probability"],
            adhd_window_percentage=agg_metrics["adhd_window_percentage"],
            total_windows=num_windows,
            folder_context=folder_ctx,
            ground_truth_label=ground_truth,
            concordance=concordance_status,
            error=None,
            details=details,
            model_probabilities=agg_metrics.get("model_probabilities"),
            ensemble_weights=agg_metrics.get("ensemble_weights"),
            threshold=agg_metrics.get("threshold"),
        )

    @classmethod
    def format_failure(
        cls,
        display_name: str,
        error_msg: str
    ) -> FilePredictionResult:
        """
        Create a failure result for corrupt files or internal processing errors.
        """
        return FilePredictionResult(
            filename=display_name,
            status="failed",
            is_valid_eeg=False,
            signal_type="Unknown / Error",
            error=error_msg,
            folder_context=infer_folder_label(display_name)
        )

    @classmethod
    def aggregate_batch(
        cls,
        results: List[FilePredictionResult],
        batch_type: str,
        archive_name: Optional[str] = None
    ) -> BatchPredictionResponse:
        """
        Aggregate results into a batch response with clinical validation metrics.
        """
        successful = [r for r in results if r.status == "success"]
        invalid_signal = [r for r in results if r.status == "invalid_input"]
        failed = [r for r in results if r.status == "failed"]

        adhd_count = sum(1 for r in successful if r.prediction == "ADHD")
        control_count = sum(1 for r in successful if r.prediction == "Control")

        # Ground truth concordance calculation (if cohort tags present)
        gt_adhd = sum(1 for r in successful if r.ground_truth_label and r.ground_truth_label.upper() == "ADHD")
        gt_control = sum(1 for r in successful if r.ground_truth_label and r.ground_truth_label.upper() == "CONTROL")
        concordance_acc = None
        if (gt_adhd + gt_control) > 0 and len(successful) > 0:
            matching = sum(
                1 for r in successful
                if r.ground_truth_label and r.prediction and r.ground_truth_label.upper() == r.prediction.upper()
            )
            concordance_acc = round((matching / (gt_adhd + gt_control)) * 100.0, 2)

        summary = BatchSummary(
            total_files=len(results),
            successful_files=len(successful),
            failed_files=len(failed),
            invalid_signal_files=len(invalid_signal),
            adhd_predictions=adhd_count,
            control_predictions=control_count,
            ground_truth_adhd=gt_adhd if (gt_adhd + gt_control) > 0 else None,
            ground_truth_control=gt_control if (gt_adhd + gt_control) > 0 else None,
            concordance_accuracy=concordance_acc
        )

        # Determine overall batch status and diagnostic message
        if len(successful) > 0:
            overall_status = "success"
            is_valid = True
            msg = f"Processed {len(successful)} valid EEG recordings."
            if len(invalid_signal) > 0:
                msg += f" {len(invalid_signal)} non-EEG metadata files were safely excluded."
        elif len(invalid_signal) > 0 and len(successful) == 0:
            overall_status = "invalid_input"
            is_valid = False
            first_reason = invalid_signal[0].rejection_reason or invalid_signal[0].error or "Incompatible signal format."
            msg = (
                f"Invalid data for prediction: None of the {len(results)} files in "
                f"'{archive_name or 'the upload'}' could be evaluated. {first_reason} "
                "Predictions were halted because valid 19-channel clinical EEG signals could not be established."
            )
        else:
            overall_status = "failed"
            is_valid = False
            msg = f"Failed to process {len(failed)} files."

        return BatchPredictionResponse(
            batch_type=batch_type,
            archive_name=archive_name,
            summary=summary,
            results=results,
            status=overall_status,
            is_valid_eeg=is_valid,
            message=msg
        )
