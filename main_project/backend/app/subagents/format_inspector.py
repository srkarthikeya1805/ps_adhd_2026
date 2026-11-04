from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from app.config import SUPPORTED_EXTENSIONS
from app.parsers import (
    extract_channel_names_from_companion_file,
    parse_eeg_file,
)
from app.parsers.base import EEGRecording
from app.parsers.zip_parser import METADATA_EXACT_STEMS
from app.subagents.bio_authenticator import TASK_METADATA_KEYWORDS
from app.utils.logging import log_pipeline_step


class FormatInspectorSubagent:
    """
    Subagent responsible for polymorphic format inspection and schema extraction.
    
    Inspects incoming files across all supported extensions (.mat, .edf, .bdf, .gdf,
    .csv, .tsv, .txt, .npy, .npz), sniffs tabular schemas for experimental task logs,
    and returns standardized EEGRecording objects.
    """

    @classmethod
    def inspect_and_parse(
        cls,
        path: Path,
        sampling_rate_override: Optional[float] = None,
        fallback_channel_names: Optional[List[str]] = None
    ) -> EEGRecording:
        """
        Inspect file structure and parse using the format-specific engine.
        """
        ext = path.suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file format '{ext}'. Supported formats: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
            )

        stem_lower = path.stem.lower()

        # Check if stem matches task metadata keywords
        is_task_stem = any(
            kw in stem_lower
            for kw in ["trial_sequence", "trial_seq", "trialsequence", "stimulus_log", "task_log", "stim_events"]
        )

        recording = parse_eeg_file(
            path,
            sampling_rate_override=sampling_rate_override,
            fallback_channel_names=fallback_channel_names
        )

        if is_task_stem:
            recording.metadata["is_task_metadata"] = True
            recording.metadata["detected_schema"] = "task_metadata"

        # Check if extracted channel names match task metadata keywords
        if recording.channel_names:
            ch_lower = [str(c).strip().lower() for c in recording.channel_names]
            task_matches = [c for c in ch_lower if c in TASK_METADATA_KEYWORDS]
            if len(task_matches) >= 2 or (len(task_matches) > 0 and len(ch_lower) <= 4):
                recording.metadata["is_task_metadata"] = True
                recording.metadata["detected_schema"] = "task_metadata"
                recording.warnings.append(
                    f"Tabular schema contains task metadata columns: {task_matches}."
                )

        log_pipeline_step(
            "FORMAT_INSPECT",
            f"Inspected '{path.name}': format={recording.source_format}, "
            f"shape={recording.data.shape if recording.data is not None else None}, "
            f"task_metadata={recording.metadata.get('is_task_metadata', False)}"
        )

        return recording
