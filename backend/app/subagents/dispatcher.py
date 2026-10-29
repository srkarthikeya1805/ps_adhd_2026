from concurrent.futures import ThreadPoolExecutor, as_completed
import os
from pathlib import Path
from typing import List, Optional, Tuple

from app.parsers.zip_parser import METADATA_EXACT_STEMS, extract_zip_archive_safely
from app.parsers import extract_channel_names_from_companion_file
from app.schemas.responses import BatchPredictionResponse, FilePredictionResult
from app.subagents.bio_authenticator import BioSignalAuthenticatorSubagent
from app.subagents.format_inspector import FormatInspectorSubagent
from app.subagents.inference_agent import InferenceSubagent
from app.subagents.preprocessor import PreprocessorSubagent
from app.subagents.reporter import ReporterSubagent
from app.utils.logging import log_pipeline_step


class DispatcherSubagent:
    """
    Dispatcher Subagent:
    Orchestrates the multi-agent electrophysiological validation and diagnostic pipeline.
    
    Coordinates:
    - Dispatching to format inspectors
    - Neurophysiological EEG authenticity verification
    - High-speed concurrent multi-threading for batch archives
    - Deep learning ensemble inference
    - Structured clinical report generation
    """

    @classmethod
    def process_file(
        cls,
        path: Path,
        display_name: str,
        sampling_rate_override: Optional[float] = None,
        fallback_channel_names: Optional[List[str]] = None
    ) -> FilePredictionResult:
        """
        Execute end-to-end processing for a single file through the subagent pipeline.
        """
        try:
            # 1. Format Inspection Subagent
            recording = FormatInspectorSubagent.inspect_and_parse(
                path,
                sampling_rate_override=sampling_rate_override,
                fallback_channel_names=fallback_channel_names
            )

            # 2. Bio-Signal Authenticator Subagent (The core neurophysiological EEG verifier)
            auth_res = BioSignalAuthenticatorSubagent.evaluate(
                data=recording.data,
                sampling_rate=recording.sampling_rate,
                channel_names=recording.channel_names,
                filename=display_name,
                metadata=recording.metadata
            )

            # If input is not genuine electrophysiological EEG brainwaves: HALT PREDICTION!
            if not auth_res.is_valid_eeg:
                log_pipeline_step(
                    "DISPATCHER",
                    f"Prediction HALTED for '{display_name}': {auth_res.rejection_reason}"
                )
                return ReporterSubagent.format_invalid_signal(display_name, auth_res)

            # 3. Preprocessing Subagent (Channel harmonization, 128 Hz resampling, filtering, windowing)
            X, continuous_preprocessed, final_fs, channel_names, warnings = PreprocessorSubagent.process(recording)

            # 4. Diagnostic Inference Subagent (CNN-Transformer + EEGNet + XGBoost)
            mean_prob, pred_class, window_probs, window_records, agg_metrics = InferenceSubagent.predict(
                X, display_name
            )

            # 5. Reporter Subagent (Success response)
            return ReporterSubagent.format_success(
                display_name=display_name,
                recording=recording,
                continuous_preprocessed=continuous_preprocessed,
                final_fs=final_fs,
                channel_names=channel_names,
                warnings=warnings,
                num_windows=len(X),
                mean_prob=mean_prob,
                pred_class=pred_class,
                window_probs=window_probs,
                window_records=window_records,
                agg_metrics=agg_metrics,
                path_suffix=path.suffix
            )

        except Exception as exc:
            log_pipeline_step("DISPATCHER", f"Processing error on '{display_name}': {exc}")
            return ReporterSubagent.format_failure(display_name, str(exc))

    @classmethod
    def process_batch(
        cls,
        files_with_names: List[Tuple[Path, str]],
        sampling_rate_override: Optional[float] = None,
        fallback_channel_names: Optional[List[str]] = None,
        max_workers: Optional[int] = None
    ) -> List[FilePredictionResult]:
        """
        Execute concurrent parallel processing across multiple candidate files.
        Dramatically accelerates workflow speed for multi-file and ZIP archives.
        """
        if not files_with_names:
            return []

        # Determine worker pool size (up to 8 threads or cpu_count)
        pool_size = max_workers or min(8, max(2, (os.cpu_count() or 4)))

        # Preserve order of original input
        results_dict: dict = {}

        with ThreadPoolExecutor(max_workers=pool_size) as executor:
            future_to_idx = {
                executor.submit(
                    cls.process_file,
                    path,
                    display_name,
                    sampling_rate_override,
                    fallback_channel_names
                ): idx
                for idx, (path, display_name) in enumerate(files_with_names)
            }

            for future in as_completed(future_to_idx):
                idx = future_to_idx[future]
                try:
                    res = future.result()
                except Exception as exc:
                    path, display_name = files_with_names[idx]
                    res = ReporterSubagent.format_failure(display_name, str(exc))
                results_dict[idx] = res

        # Sort back to original order
        return [results_dict[i] for i in range(len(files_with_names))]

    @classmethod
    def discover_companion_channels(cls, files: List[Path]) -> Optional[List[str]]:
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

    @classmethod
    def process_zip_archive(
        cls,
        archive_path: Path,
        extract_dir: Path,
        sampling_rate_override: Optional[float] = None
    ) -> BatchPredictionResponse:
        """
        Extract and process a full ZIP archive using high-speed parallel workers.
        """
        archive_name = archive_path.name
        eeg_files, ignored_files = extract_zip_archive_safely(archive_path, extract_dir)

        # Check if the entire archive is named trial_sequence or similar task log archive
        archive_stem = archive_path.stem.lower()
        is_task_archive = any(
            kw in archive_stem
            for kw in ["trial_sequence", "trial_sequences", "trialsequence", "stimulus_presentation", "task_metadata"]
        )

        # If no files found in eeg_files, check ignored files
        candidate_paths = eeg_files if eeg_files else ignored_files

        if not candidate_paths:
            raise ValueError("No supported files found in the ZIP archive.")

        companion_channels = cls.discover_companion_channels(ignored_files)

        # Build list of (path, relative_display_name)
        files_with_names = [
            (p, str(p.relative_to(extract_dir)))
            for p in candidate_paths
        ]

        # Process all files in parallel
        results = cls.process_batch(
            files_with_names=files_with_names,
            sampling_rate_override=sampling_rate_override,
            fallback_channel_names=companion_channels
        )

        return ReporterSubagent.aggregate_batch(
            results=results,
            batch_type="zip_archive",
            archive_name=archive_name
        )
