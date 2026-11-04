from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool
    device: str
    version: str = "3.0.0"


class ModelInfoResponse(BaseModel):
    model_loaded: bool
    input_shape: List[Optional[int]]
    output_shape: List[Optional[int]]
    architecture: str
    sampling_rate: float
    window_seconds: int
    window_samples: int
    channels: int
    channel_names: List[str]
    device: str
    total_params: int
    models: Optional[List[str]] = None
    weights: Optional[Dict[str, float]] = None
    threshold: Optional[float] = None


class ValidationReport(BaseModel):
    file: str
    valid: bool
    format: str
    signal_shape: Optional[List[int]] = None
    sampling_rate: Optional[float] = None
    target_sampling_rate: float = 128.0
    channels_detected: Optional[int] = None
    channel_names: Optional[List[str]] = None
    required_channels_available: bool = False
    duration_seconds: Optional[float] = None
    windows_count: Optional[int] = None
    model_compatible: bool = False
    is_valid_eeg: Optional[bool] = None
    signal_type: Optional[str] = None
    rejection_reason: Optional[str] = None
    issues: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class WindowPrediction(BaseModel):
    window: int
    start_seconds: float
    end_seconds: float
    adhd_probability: float
    prediction: str


class FilePredictionDetails(BaseModel):
    source: str
    format: str
    sampling_rate_original: Optional[float] = None
    sampling_rate_used: float
    resampled: bool
    original_shape: List[int]
    preprocessed_shape: List[int]
    channels_original: int
    channels_used: int
    channel_names: List[str]
    duration_seconds: float
    window_seconds: int
    window_samples: int
    overlap: float
    windows: int
    warnings: List[str] = Field(default_factory=list)
    window_probabilities: List[float] = Field(default_factory=list)
    window_predictions: Optional[List[WindowPrediction]] = None
    model_probabilities: Optional[Dict[str, float]] = None
    ensemble_weights: Optional[Dict[str, float]] = None
    threshold: Optional[float] = None


class FilePredictionResult(BaseModel):
    filename: str
    status: str  # "success", "failed", or "invalid_input"
    is_valid_eeg: Optional[bool] = None
    signal_type: Optional[str] = None
    rejection_reason: Optional[str] = None
    prediction: Optional[str] = None  # "ADHD" or "Control"
    adhd_probability: Optional[float] = None
    confidence: Optional[float] = None
    mean_adhd_probability: Optional[float] = None
    median_adhd_probability: Optional[float] = None
    adhd_window_percentage: Optional[float] = None
    total_windows: Optional[int] = None
    folder_context: Optional[str] = None
    ground_truth_label: Optional[str] = None
    concordance: Optional[str] = None
    error: Optional[str] = None
    details: Optional[FilePredictionDetails] = None
    model_probabilities: Optional[Dict[str, float]] = None
    ensemble_weights: Optional[Dict[str, float]] = None
    threshold: Optional[float] = None


class BatchSummary(BaseModel):
    total_files: int
    successful_files: int
    failed_files: int
    invalid_signal_files: int = 0
    adhd_predictions: int
    control_predictions: int
    ground_truth_adhd: Optional[int] = None
    ground_truth_control: Optional[int] = None
    concordance_accuracy: Optional[float] = None


class BatchPredictionResponse(BaseModel):
    batch_type: str  # "single_file", "multiple_files", "zip_archive"
    archive_name: Optional[str] = None
    summary: BatchSummary
    results: List[FilePredictionResult]
    status: str  # "success", "failed", or "invalid_input"
    is_valid_eeg: Optional[bool] = True
    message: Optional[str] = None

