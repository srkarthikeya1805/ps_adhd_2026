export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  device: string;
  version: string;
}

export interface BackendRootInfo {
  status: string;
  service: string;
  version: string;
  model: {
    name: string;
    loaded: boolean;
    device: string;
    sampling_rate_hz: number;
    window_seconds: number;
    window_samples: number;
    channels_required: number;
    model_input_shape: (number | null)[];
    channel_order: string[];
  };
  supported_formats: string[];
  archive_support: string[];
  endpoints: Record<string, string>;
}

export interface ModelInfoResponse {
  model_loaded: boolean;
  input_shape: (number | null)[];
  output_shape: (number | null)[];
  architecture: string;
  sampling_rate: number;
  window_seconds: number;
  window_samples: number;
  channels: number;
  channel_names: string[];
  device: string;
  total_params: number;
  models?: string[];
  weights?: Record<string, number>;
  threshold?: number;
}

export interface ValidationReport {
  file: string;
  valid: boolean;
  format: string;
  signal_shape?: number[] | null;
  sampling_rate?: number | null;
  target_sampling_rate: number;
  channels_detected?: number | null;
  channel_names?: string[] | null;
  required_channels_available: boolean;
  duration_seconds?: number | null;
  windows_count?: number | null;
  model_compatible: boolean;
  issues: string[];
  warnings: string[];
}

export interface WindowPrediction {
  window: number;
  start_seconds: number;
  end_seconds: number;
  adhd_probability: number;
  prediction: 'ADHD' | 'Control' | string;
}

export interface FilePredictionDetails {
  source: string;
  format: string;
  sampling_rate_original?: number | null;
  sampling_rate_used: number;
  resampled: boolean;
  original_shape: number[];
  preprocessed_shape: number[];
  channels_original: number;
  channels_used: number;
  channel_names: string[];
  duration_seconds: number;
  window_seconds: number;
  window_samples: number;
  overlap: number;
  windows: number;
  warnings: string[];
  window_probabilities?: number[];
  window_predictions?: WindowPrediction[];
  model_probabilities?: Record<string, number>;
  ensemble_weights?: Record<string, number>;
  threshold?: number;
}

export interface FilePredictionResult {
  filename: string;
  status: 'success' | 'failed' | 'invalid_input' | string;
  is_valid_eeg?: boolean | null;
  signal_type?: string | null;
  rejection_reason?: string | null;
  prediction?: 'ADHD' | 'Control' | string | null;
  adhd_probability?: number | null;
  confidence?: number | null;
  mean_adhd_probability?: number | null;
  median_adhd_probability?: number | null;
  adhd_window_percentage?: number | null;
  total_windows?: number | null;
  folder_context?: string | null;
  ground_truth_label?: string | null;
  concordance?: string | null;
  error?: string | null;
  details?: FilePredictionDetails | null;
  model_probabilities?: Record<string, number> | null;
  ensemble_weights?: Record<string, number> | null;
  threshold?: number | null;
}

export interface BatchSummary {
  total_files: number;
  successful_files: number;
  failed_files: number;
  invalid_signal_files?: number;
  adhd_predictions: number;
  control_predictions: number;
  mean_confidence?: number;
  ground_truth_adhd?: number | null;
  ground_truth_control?: number | null;
  concordance_accuracy?: number | null;
}


export interface BatchPredictionResponse {
  batch_type: 'single_file' | 'multiple_files' | 'zip_archive' | string;
  archive_name?: string | null;
  total_files?: number;
  successful?: number;
  failed?: number;
  summary: BatchSummary;
  results: FilePredictionResult[];
  status?: 'success' | 'failed' | 'invalid_input' | string;
  is_valid_eeg?: boolean | null;
  message?: string | null;
}




export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  filename: string;
  prediction: string;
  adhd_probability: number;
  confidence: number;
  windows: number;
  duration_seconds: number;
  batch_type: string;
  raw_result: FilePredictionResult;
}

export type BrainRegionKey = 'frontal' | 'parietal' | 'temporal' | 'occipital';

export interface BrainRegionInfo {
  key: BrainRegionKey;
  name: string;
  scientificName: string;
  color: string;
  channels: string[];
  functionDescription: string;
  adhdRelevance: string;
  eegConsideration: string;
}
