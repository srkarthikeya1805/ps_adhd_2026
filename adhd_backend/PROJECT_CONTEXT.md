# Project Context & Architectural Documentation

**Project Title:** The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG  
**Category:** Neuro / Clinical Artificial Intelligence  
**Problem Statement:** Attention Deficit Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder characterized by inattention, hyperactivity, and impulsive behavior. Current clinical diagnosis relies largely on behavioral assessments, clinical observations, and questionnaires, which can be subjective and time-consuming. This project develops an AI-based system that analyzes electroencephalography (EEG) brain signals to automatically identify ADHD-related neural activity patterns and assist clinicians in early, objective diagnosis.

---

## 1. System Architecture Overview

The system processes raw, multi-format EEG data through a modular, deterministic pipeline before passing 10-second temporal windows through a hybrid deep learning ensemble.

```
+-----------------------------------------------------------------------------------------+
|                                1. Ingestion & File Handling                             |
|  - ZIP Archive Safe Extraction (Zip-Slip defense, arbitrary depth rglob traversal)      |
|  - Companion Metadata Segregation (chan.mat, sub_name_stim.mat, y_stim.mat, readme.txt) |
|  - Single & Multi-File Upload Handling (.mat, .edf, .bdf, .gdf, .csv, .tsv, .npy)       |
+------------------------------------------------------------+----------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------+
|                                2. Polymorphic Signal Parser                             |
|  - MATLAB v5 / v7.0: Numeric arrays, structs, and nested cell arrays                    |
|  - MATLAB v7.3 (HDF5): Dataset hierarchy extraction via h5py                            |
|  - MATLAB MCOS Tables: Raw binary stream parser for MATLAB table objects                |
|  - MNE Integration: European Data Format (.edf, .bdf, .gdf, .set, .fif)                 |
|  - Tabular & Array Parsers: CSV, TSV with header detection, NumPy (.npy/.npz)           |
+------------------------------------------------------------+----------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------+
|                                3. Universal Preprocessing                               |
|  - Orientation: Auto-detection of time vs. channel axes                                 |
|  - Channel Harmonization: 60+ alias lookup table mapped to 10-20 standard (19 channels) |
|  - Symmetrical Topographic Projection: Maps sparse (e.g. 2-ch) montages across scalp    |
|  - Polyphase Rational Resampling: Converts any sampling rate (200, 250, 500 Hz) to 128Hz|
|  - DSP Filtering: 4th-order Butterworth bandpass (1.0-45.0 Hz) + 50 Hz Notch filter     |
|  - Normalization: Per-channel zero-mean unit-variance z-score standardization           |
|  - Spectral Profiling: Individual Alpha Peak Frequency (IAF) & Theta/Beta Ratio (TBR)   |
|  - Segmentation: 10-second overlapping windows (1280 samples, 50% overlap = 640 stride) |
+------------------------------------------------------------+----------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------+
|                                4. Hybrid Deep Learning Models                           |
|  - CNN-Transformer (Weight = 0.50): 1D Convolutions + Multi-Head Self-Attention Head     |
|  - EEGNet (Weight = 0.25): Depthwise & Separable Spatio-Temporal Convolutions          |
|  - Welch PSD + XGBoost (Weight = 0.25): Power spectral density in Delta, Theta, Alpha,  |
|    Beta, Gamma frequency bands                                                          |
|  - Ensemble Aggregation: Weighted sum of window probabilities -> Whole-recording vote   |
+------------------------------------------------------------+----------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------+
|                                5. Clinical API Response                                 |
|  - Output Schema: batch_type, archive_name, summary (total, successful, failed, counts) |
|  - Results: filename, status, prediction, probabilities, confidence, folder_context     |
|  - Window Breakdown: start/end seconds, window probability, window prediction           |
|  - Details: original & preprocessed shapes, sampling rates, 19-channel array            |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Benchmark Datasets Supported & Ground Truth

The project is verified against four major publicly accessible clinical research datasets:

| Dataset | Provenance & Literature Reference | Participant Breakdown | Channels & Sampling Rate | Expected Classification |
| :--- | :--- | :--- | :--- | :--- |
| **IEEE DataPort** | Ali Motie Nasrabadi et al. (2020), *IEEE DataPort* (`eeg-data-adhd-control-children`) | 121 children (ages 7–12; 61 ADHD, 60 Control) performing visual attention counting task | 19 channels, 128 Hz | **61 ADHD, 60 Control** *(100% evaluated)* |
| **Mendeley Data** | Ghasem Sadeghi Bajestani, Shima Abedian, et al. (2023), DOI: 10.17632/6k4g25fhzg.1 | 79 adults (37 ADHD, 42 Controls) during resting-state and sound paradigms | 2 channels, 128/250/256 Hz (topographically projected) | **2 ADHD (`FADHD`, `MADHD`), 2 Control (`FC`, `MC`)** |
| **RepOD / Nature** (`Raw_data.zip`) | Dr. Monika Prucnal et al. (2024), Wrocław University of Tech, RepOD DOI: 10.18150/YHSZR3 | 16 adults (8 ADHD, 8 Control) across 9 tasks (Stroop, Flanker, Stop Signal, Go/No-Go) | 19 channels, 500 Hz (MCOS tables) | **72 ADHD, 72 Control** *(144 files total)* |
| **Figshare** (`figsharre.zip`) | Multi-channel Continuous EEG Split Archive | Continuous multi-channel signal split across 7 data segments due to 5 GB file limit | 56 channels, 128/250/256 Hz | **7 Successful Signals (`d1`–`d7`), 0 Failed Files** |

---

## 3. Detailed File Handling & Parser Capabilities

1. **ZIP Extraction Engine (`app/parsers/zip_parser.py`)**:
   * Uses recursive path exploration (`destination_dir.rglob("*")`) to unpack folders nested at any depth or structure.
   * Defends against Zip-Slip attacks and rejects compressed archive bombs exceeding safety limits.
   * Automatically detects and segregates non-signal companion metadata (e.g. `chan.mat`, `sub_name_stim.mat`, `y_stim.mat`, `events.csv`, `triggers.mat`, `readme.txt`), preventing extraction failures.

2. **MATLAB Parser (`app/parsers/mat_parser.py`)**:
   * **v5/v7.0 (`scipy.io.loadmat`)**: Traverses numeric arrays, nested structures, and cell arrays.
   * **v7.3 HDF5 (`h5py`)**: Walks HDF5 object trees, resolving cell references and complex matrices.
   * **MCOS Table Extractor**: Extracts raw float64 signal arrays stored inside MATLAB table objects by scanning object block headers and IEEE double-precision sequences.

3. **MNE Biological Format Parser (`app/parsers/edf_parser.py`)**:
   * Reads European Data Format (`.edf`), BioSemi (`.bdf`), General Data Format (`.gdf`), EEGLAB (`.set`), and Neuromag (`.fif`).

---

## 4. Preprocessing Pipeline (`app/preprocessing/`)

1. **Channel Harmonization (`channels.py`)**:
   * Resolves channel names against a 60+ alias lookup table (e.g. `EEG F3-A1`, `F3_AA`, `F3-REF` $\rightarrow$ `F3`).
   * Targets the exact 19 standard channels required by the model:
     `['Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8', 'T3', 'C3', 'Cz', 'C4', 'T4', 'T5', 'P3', 'Pz', 'P4', 'T6', 'O1', 'O2']`.
   * **Sparse Channel Projection (`project_sparse_to_19_channels`)**: When recordings with 1–4 channels (like 2-channel portable headsets) are uploaded, channels are topographically mapped across left hemisphere, right hemisphere, and midline channels ($[Ch_0 + Ch_1]/2$), preserving spatial symmetry.

2. **Resampling (`resampling.py`)**:
   * Rational polyphase filtering transforms input signals from any native sampling rate ($200\text{ Hz}$, $250\text{ Hz}$, $500\text{ Hz}$, $1000\text{ Hz}$) to exactly $128.0\text{ Hz}$.

3. **Filtering (`filtering.py`)**:
   * Zero-phase 4th-order Butterworth bandpass filter ($1.0 - 45.0\text{ Hz}$).
   * 50 Hz powerline notch filter ($Q=30$).

4. **Normalization (`normalization.py`)**:
   * Per-channel zero-mean, unit-variance z-score standardization:
     $$x_{\text{norm}} = \frac{x - \mu}{\sigma + 10^{-8}}$$

5. **Spectral Profiling (`spectral.py`)**:
   * Calculates Individual Alpha Peak Frequency (IAF) between 7 and 13 Hz.
   * Calculates frontal Theta/Beta Ratio (TBR) to categorize pediatric vs. adult developmental baselines.

6. **Temporal Windowing (`windowing.py`)**:
   * Segments signals into 10-second windows ($1280\text{ samples}$ at $128\text{ Hz}$) with $50\%$ overlap ($640\text{ sample stride}$).

---

## 5. Model Architecture & Ensemble

The classification engine uses a weighted ensemble of complementary machine learning architectures:

1. **CNN-Transformer (`cnn_transformer.keras`, Weight: 0.50)**:
   * **1D Temporal Convolutions**: Extracts local spatio-temporal signal motifs.
   * **Multi-Head Self-Attention Transformer Head**: Captures long-range temporal dependencies across the 10-second window using trainable `PositionalEmbedding`.
2. **EEGNet (`eegnet.keras`, Weight: 0.25)**:
   * Uses depthwise and separable convolutions specifically tailored for EEG neuroimaging.
3. **Welch PSD + XGBoost (`xgboost.json`, Weight: 0.25)**:
   * Extracts power spectral density features across Delta (1–4 Hz), Theta (4–8 Hz), Alpha (8–13 Hz), Beta (13–30 Hz), and Gamma (30–45 Hz) bands.

**Decision Boundary**:
$$\text{Ensemble Score} = 0.50 \cdot P_{\text{CNN-Transformer}} + 0.25 \cdot P_{\text{EEGNet}} + 0.25 \cdot P_{\text{XGBoost}}$$
A score $\ge 0.50$ classifies as **ADHD**, and $< 0.50$ classifies as **Control**.

---

## 6. API Endpoints

* **`POST /api/predict`**: Predicts on uploaded single files, multiple files, or ZIP archives.
* **`POST /api/predict/batch`**: Alias for batch file prediction.
* **`POST /api/validate`**: Validates file integrity, channel availability, and sampling rate without running inference.
* **`GET /api/model/info`**: Returns model architecture, input/output tensor shapes, and parameter counts.
* **`GET /health` / `GET /api/health`**: Health check reporting model loading status and computation device (CPU/GPU).
