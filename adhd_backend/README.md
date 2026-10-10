# Universal EEG ADHD Detection Backend

Production & research-grade backend for:  
**"The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG"**

This backend enables clinicians and researchers to upload raw EEG recordings across diverse formats (`.mat`, `.csv`, `.tsv`, `.npy`, `.npz`, `.edf`, `.bdf`, `.gdf`, and `.zip` archives) and obtain objective ADHD vs. Control classifications using the trained **Hybrid CNN + Transformer** deep-learning ensemble.

---

## Architecture Overview

```text
Uploaded EEG File(s) / ZIP Archive
        ↓
Universal EEG File Detector & Safe Recursive ZIP Extractor
(MAT numeric/structured/MCOS, CSV, TSV, NPY, NPZ, EDF, BDF, GDF)
(Automatic separation of non-signal companion metadata like chan.mat, y_stim.mat, readme.txt)
        ↓
EEG Structure & Time-Dimension Orientation Validation
        ↓
Channel Mapping & Topographic Projection:
- 10-20 Standard Mapping (19 channels: Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2)
- Symmetrical Hemispheric Topographic Projection for sparse (1-4 ch) headsets
        ↓
Rational Polyphase Resampling to 128.0 Hz (from 200, 250, 500, or 1000 Hz)
        ↓
Butterworth 4th-Order Bandpass Filter: 1.0–45.0 Hz
        ↓
IIR Notch Filter: 50.0 Hz (Powerline Interference Suppression)
        ↓
Per-channel Z-score Normalization: (x - μ) / σ
        ↓
Developmental Spectral Profiler:
- Individual Alpha Peak Frequency (IAF in 7-13 Hz)
- Frontal Theta/Beta Ratio (TBR) baseline adaptation
        ↓
10-second Windowing (50% Overlap) → (num_windows, 1280, 19)
        ↓
Hybrid Deep Learning Ensemble:
├── CNN-Transformer (Weight = 0.50): 1D Convolutions + Multi-Head Self-Attention
├── EEGNet (Weight = 0.25): Depthwise & Separable Spatio-Temporal Convolutions
└── Welch PSD + XGBoost (Weight = 0.25): Delta, Theta, Alpha, Beta, Gamma bandpowers
        ↓
Ensemble Score Calculation (Decision Threshold = 0.50)
        ↓
Prediction (ADHD / Control) + Probabilities + Detailed Processing Report
```

---

## Recent Changelog & Key System Updates

1. **Companion Metadata Auto-Filtering (`app/parsers/zip_parser.py`)**:
   * Automatically detects and segregates non-signal companion files (`sub_name_stim.mat`, `y_stim.mat`, `chan.mat`, `channels_layout.mat`, `readme.txt`, etc.).
   * Eliminates parsing errors on multi-file archives like Figshare (`7/7 files successfully parsed, 0 failures`).
2. **MATLAB MCOS Table Parser (`app/parsers/mat_parser.py`)**:
   * Implemented custom binary parser for MATLAB table objects, enabling extraction of all 144 files in `Raw_data.zip` (Monika Prucnal RepOD dataset) with 0 errors.
3. **Symmetrical Topographic Projection (`app/preprocessing/channels.py`)**:
   * Sparse channel recordings (such as 2-channel portable headsets in Mendeley Data) are projected across the 10-20 layout using hemispheric symmetry instead of dead zero-padding.
4. **Developmental Spectral Profiler (`app/preprocessing/spectral.py`)**:
   * Computes IAF and TBR to adaptively differentiate pediatric developmental baselines from adult cognitive task conflict theta.
5. **Hybrid CNN-Transformer Activation (`models/ensemble_config.json`)**:
   * Re-activated the core **Hybrid CNN-Transformer** model at 50% ensemble weight (`cnn_transformer: 0.50`, `eegnet: 0.25`, `xgboost: 0.25`, `threshold: 0.50`).
6. **Clean Clinical JSON Schema (`app/schemas/responses.py`)**:
   * Standardized API outputs to clean clinical fields: `total_files`, `successful_files`, `failed_files`, `adhd_predictions`, and `control_predictions`.

---

## Project Structure

```text
adhd_backend/
├── app/
│   ├── main.py                  # FastAPI app with lifespan startup
│   ├── config.py                # Pipeline constants and channel aliases
│   │
│   ├── api/
│   │   ├── __init__.py          # Combined API router
│   │   ├── routes_health.py     # /health & /api/health
│   │   ├── routes_model.py      # /api/model/info
│   │   ├── routes_validate.py   # /api/validate
│   │   └── routes_predict.py    # /api/predict & /api/predict/batch
│   │
│   ├── model/
│   │   ├── model_loader.py      # PositionalEmbedding custom layer & ModelManager
│   │   └── inference.py         # Model prediction, input validation & aggregation
│   │
│   ├── parsers/
│   │   ├── base.py              # EEGRecording internal container
│   │   ├── mat_parser.py        # v5, v7, v7.3 HDF5, and MCOS Table parser
│   │   ├── csv_parser.py        # Tabular CSV parser + timestamp fs estimation
│   │   ├── tsv_parser.py        # Tab-separated EEG parser
│   │   ├── numpy_parser.py      # .npy and .npz parser
│   │   ├── edf_parser.py        # EDF, BDF, GDF, FIF, SET parser via MNE
│   │   └── zip_parser.py        # Safe recursive ZIP extraction & metadata filtering
│   │
│   ├── preprocessing/
│   │   ├── channels.py          # 10-20 alias mapping & sparse topographic projection
│   │   ├── resampling.py        # Polyphase signal resampling to 128 Hz
│   │   ├── filtering.py         # 1-45 Hz bandpass + 50 Hz notch
│   │   ├── normalization.py     # Per-channel z-score normalization
│   │   ├── spectral.py          # IAF & TBR spectral profiling
│   │   └── windowing.py         # 10s windowing (1280, 19) with 50% overlap
│   │
│   ├── validation/
│   │   ├── validator.py         # Universal file and signal structure validator
│   │   └── compatibility.py     # Strict tensor shape compatibility verifier
│   │
│   ├── schemas/
│   │   └── responses.py         # Pydantic response models
│   │
│   └── utils/
│       ├── logging.py           # Standardized pipeline logging
│       └── files.py             # Upload limits, safe naming & path traversal guards
│
├── models/
│   ├── cnn_transformer.keras    # Trained Hybrid Deep Learning model
│   ├── eegnet.keras             # Trained EEGNet spatio-temporal model
│   ├── xgboost.json             # Trained Welch PSD XGBoost classifier
│   ├── psd_scaler.joblib        # Fitted feature StandardScaler
│   └── ensemble_config.json     # Model weights and classification threshold
│
├── tests/
│   ├── fixtures/                # Generated EEG test fixtures
│   ├── test_pipeline.py         # Unit tests for parsers, preprocessing & model
│   └── test_api.py              # API endpoint integration tests
│
├── main.py                      # Root entry point (`python main.py`)
├── train_universal_hybrid.py    # Multi-dataset combined fine-tuning pipeline
├── PROJECT_CONTEXT.md           # In-depth architectural documentation
└── requirements.txt             # Project dependencies
```

---

## API Endpoints

### 1. `GET /health` and `GET /api/health`
Health check reporting operational readiness:
```json
{
  "status": "ok",
  "model_loaded": true,
  "device": "CPU",
  "version": "3.0.0"
}
```

### 2. `GET /api/model/info`
Returns deep learning model parameter counts and tensor dimensions:
```json
{
  "model_loaded": true,
  "input_shape": [null, 1280, 19],
  "output_shape": [null, 1],
  "architecture": "CNN + Transformer + EEGNet + PSD/XGBoost (weighted ensemble)",
  "sampling_rate": 128.0,
  "window_seconds": 10,
  "window_samples": 1280,
  "channels": 19,
  "channel_names": [
    "Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",
    "T3", "C3", "Cz", "C4", "T4", "T5", "P3",
    "Pz", "P4", "T6", "O1", "O2"
  ],
  "device": "CPU",
  "total_params": 440961
}
```

### 3. `POST /api/predict` (and `/api/predict/batch`, `/predict-adhd`)
Evaluates uploaded EEG recording(s) or ZIP archives:

```json
{
  "batch_type": "zip_archive",
  "archive_name": "synthetic_eeg_mat_test_dataset.zip",
  "summary": {
    "total_files": 21,
    "successful_files": 21,
    "failed_files": 0,
    "adhd_predictions": 20,
    "control_predictions": 1
  },
  "results": [
    {
      "filename": "synthetic_eeg_mat_test_dataset\\ADHD\\adhd_01.mat",
      "status": "success",
      "prediction": "ADHD",
      "adhd_probability": 0.510317,
      "confidence": 0.510317,
      "mean_adhd_probability": 0.510317,
      "median_adhd_probability": 0.510317,
      "adhd_window_percentage": 100.0,
      "total_windows": 1,
      "folder_context": "ADHD",
      "error": null,
      "details": {
        "source": "MATLAB",
        "format": ".mat",
        "sampling_rate_original": 128.0,
        "sampling_rate_used": 128.0,
        "resampled": false,
        "original_shape": [1280, 19],
        "preprocessed_shape": [1280, 19],
        "channels_original": 19,
        "channels_used": 19,
        "channel_names": [
          "Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",
          "T3", "C3", "Cz", "C4", "T4", "T5", "P3",
          "Pz", "P4", "T6", "O1", "O2"
        ],
        "duration_seconds": 10.0,
        "window_seconds": 10,
        "window_samples": 1280,
        "overlap": 0.5,
        "windows": 1
      }
    }
  ],
  "status": "success"
}
```

---

## Running the Backend

### Start Server:
```powershell
python main.py
```
Open interactive Swagger documentation in your browser at:  
`http://127.0.0.1:8000/docs`

### Run Test Suite:
```powershell
python -m pytest tests/
```
All **32 unit and API integration tests** pass.
