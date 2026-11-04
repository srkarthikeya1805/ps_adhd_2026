"""
Subagents Package:
Multi-agent architecture dividing electrophysiological EEG analysis into
dedicated, specialized autonomous subagents.

Agents:
- DispatcherSubagent: Multi-threaded archive extraction, companion file resolution, and workflow orchestration
- FormatInspectorSubagent: Polymorphic format sniffing (.mat, .edf, .bdf, .gdf, .csv, .tsv, .npy, .npz)
- BioSignalAuthenticatorSubagent: Neurophysiological EEG validation & non-EEG task metadata detection
- PreprocessorSubagent: Symmetrical topographic projection, 128 Hz resampling, filtering, and windowing
- InferenceSubagent: Hybrid CNN-Transformer + EEGNet + XGBoost deep learning evaluation
- ReporterSubagent: Structured clinical report generation and cohort aggregation
"""

from app.subagents.bio_authenticator import BioAuthResult, BioSignalAuthenticatorSubagent
from app.subagents.dispatcher import DispatcherSubagent
from app.subagents.format_inspector import FormatInspectorSubagent
from app.subagents.inference_agent import InferenceSubagent
from app.subagents.preprocessor import PreprocessorSubagent
from app.subagents.reporter import ReporterSubagent

__all__ = [
    "DispatcherSubagent",
    "FormatInspectorSubagent",
    "BioSignalAuthenticatorSubagent",
    "BioAuthResult",
    "PreprocessorSubagent",
    "InferenceSubagent",
    "ReporterSubagent",
]
