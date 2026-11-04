# Project Context & Architectural Documentation

**Project Title:** The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG  
**Category:** Neuro / Clinical Artificial Intelligence  
**Problem Statement:** Attention Deficit Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder characterized by inattention, hyperactivity, and impulsive behavior. Current clinical diagnosis relies largely on behavioral assessments, clinical observations, and questionnaires, which can be subjective and time-consuming. This project develops an AI-based system that analyzes electroencephalography (EEG) brain signals to automatically identify ADHD-related neural activity patterns and assist clinicians in early, objective diagnosis.

---

## 1. System Architecture Overview

The system processes raw, multi-format EEG data through a modular, deterministic pipeline before passing 10-second temporal windows through a calibrated hybrid deep learning ensemble.

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
|                        3. Strict 7-Tier Bio-Signal Authenticator                        |
|  - Tier 0A: Finite numeric array & minimum sample length (≥128 samples)                 |
|  - Tier 0B: BCI Competition / Motor Imagery / Hand Gesture detection (Rejects non-ADHD) |
|  - Tier 1: Flatline / Dead channel detection (std < 1e-6)                               |
|  - Tier 2: Dynamic range & voltage saturation (>10,000 µV or unscaled floating point)   |
|  - Tier 3: Entropy / Gaussian white noise check (1.0 ≤ H_norm ≤ 0.95)                   |
|  - Tier 4: Physiological frequency bands (0.5–45 Hz) & 1/f pink-noise spectral slope    |
|  - Tier 5: Non-biological discrete integer codes, monotonic ramps & counter variables   |
|  - Tier 6: High-frequency spectral roll-off (rejects pure sine waves & clock ticks)     |
|  - Tier 7: Clinical 10-20 Montage Compatibility (Rejects sparse ≤2-ch non-10-20 setups) |
+------------------------------------------------------------+----------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------+
|                                4. Universal Preprocessing                               |
|  - Orientation: Auto-detection of time vs. channel axes                                 |
|  - Channel Harmonization: 60+ alias lookup table mapped to 10-20 standard (19 channels) |
|  - Polyphase Rational Resampling: Converts any sampling rate (200, 250, 500 Hz) to 128Hz|
|  - DSP Filtering: 4th-order Butterworth bandpass (1.0-45.0 Hz) + 50 Hz Notch filter     |
|  - Normalization: Per-channel zero-mean unit-variance z-score standardization           |
|  - Spectral Profiling: Individual Alpha Peak Frequency (IAF) & Theta/Beta Ratio (TBR)   |
|  - Segmentation: 10-second overlapping windows (1280 samples, 50% overlap = 640 stride) |
+------------------------------------------------------------+----------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------+
|                        5. Calibrated Hybrid Deep Learning Ensemble                      |
|  - CNN-Transformer (Weight = 0.60): 1D Convolutions + Multi-Head Self-Attention Head     |
|  - Welch PSD + XGBoost (Weight = 0.30): Power spectral density across Delta, Theta,      |
|    Alpha, Beta, Gamma frequency bands                                                   |
|  - EEGNet (Weight = 0.10): Depthwise & Separable Spatio-Temporal Convolutions          |
|  - Decision Threshold: 0.49 (Ensemble Score ≥ 0.49 → ADHD, < 0.49 → Control)            |
+------------------------------------------------------------+----------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------+
|                        6. Clinical Telemetry & Concordance Engine                       |
|  - Ground-Truth Inference: Automatically detects cohort labels from folder/file paths   |
|  - Concordance Telemetry: Concordance rate (%), Sensitivity (ADHD), Specificity (Control)|
|  - Window Breakdown: start/end seconds, window probability, window prediction           |
|  - Full Signal Details: original & preprocessed shapes, sampling rates, 19-channel array|
+-----------------------------------------------------------------------------------------+
```

---

## 2. Benchmark Datasets Supported & Clinical Concordance

The project is evaluated across standard clinical research cohorts, partition subsets, and negative control archives:

| Dataset / Archive | Provenance & Literature Reference | Participant Breakdown | Channels & Native Fs | Expected Clinical Cohort | Observed Model Performance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IEEE DataPort (Full)** | Ali Motie Nasrabadi et al. (2020), *IEEE DataPort* (`eeg-data-adhd-control-children`) | 121 children (ages 7–12; 61 ADHD, 60 Control) visual attention task | 19 channels, 128 Hz | 61 ADHD, 60 Control | **90.91% Concordance** (110/121)<br>Sens: **96.7%**, Spec: **85.0%** |
| **ADHD_part1.zip** | IEEE DataPort ADHD Cohort (Part 1) | 30 children diagnosed with ADHD | 19 channels, 128 Hz | 30 ADHD | **29 ADHD : 1 Control** (96.7% sensitivity) |
| **ADHD_part2.zip** | IEEE DataPort ADHD Cohort (Part 2) | 31 children diagnosed with ADHD | 19 channels, 128 Hz | 31 ADHD | **30 ADHD : 1 Control** (96.8% sensitivity) |
| **Control_part1.zip** | IEEE DataPort Control Cohort (Part 1) | 30 typically developing controls | 19 channels, 128 Hz | 30 Control | **24 Control : 6 ADHD** (80.0% specificity) |
| **Control_part2.zip** | IEEE DataPort Control Cohort (Part 2) | 30 typically developing controls | 19 channels, 128 Hz | 30 Control | **21 Control : 9 ADHD** (70.0% specificity) |
| **BCICIV_1_mat.zip** | BCI Competition IV (Motor Imagery / Hand Movements) | 14 files | 59 channels, 100/1000 Hz | Non-ADHD Paradigm | **100% Rejected (INVALID_INPUT)**<br>Reason: BCI Motor Imagery |
| **MENDELY_ADHD.zip** | Mendeley Data (Adult 2-channel portable recordings) | 4 files | 2 channels, 128/250 Hz | Sparse Adult Montage | **100% Rejected (INVALID_INPUT)**<br>Reason: Incompatible Montage |
| **trial_sequence.zip** | Visual attention task stimulus sequence logs | 52 files | N/A (Metadata logs) | Task Metadata | **100% Rejected (INVALID_INPUT)**<br>Reason: Non-Biological Metadata |

---

## 3. Specialized Multi-Agent Subagent Architecture (`app/subagents/`)

The backend coordinates six parallel, decoupled subagents:
1. **Dispatcher (`dispatcher.py`)**: Asynchronous batch coordinator, unpacking archives and orchestrating files across subagents.
2. **Format Inspector (`format_inspector.py`)**: Sniffs file magic bytes and extensions, delegating to the appropriate polymorphic parser.
3. **Bio-Signal Authenticator (`bio_authenticator.py`)**: Strict 7-tier validation gatekeeper ensuring only valid, physiological 19-channel 10-20 EEG signals proceed.
4. **Preprocessor (`preprocessor.py`)**: Harmonizes channel labels to 10-20 standard, performs rational polyphase resampling to 128 Hz, 1–45 Hz bandpass filtering, 50 Hz notch, and 10s windowing.
5. **Inference Agent (`inference_agent.py`)**: Executes the 3-model deep learning ensemble with configured weights and threshold.
6. **Reporter (`reporter.py`)**: Aggregates batch results, infers reference ground-truth cohort classifications, and computes concordance telemetry (concordance rate, sensitivity, specificity).

---

## 4. Model Architecture & Ensemble

The classification engine uses a calibrated weighted ensemble:

1. **CNN-Transformer (`cnn_transformer.keras`, Weight: 0.60)**:
   * **1D Temporal Convolutions**: Extracts local spatio-temporal signal motifs.
   * **Multi-Head Self-Attention Transformer Head**: Captures long-range temporal dependencies across the 10-second window using trainable `PositionalEmbedding`.
2. **Welch PSD + XGBoost (`xgboost.json`, Weight: 0.30)**:
   * Extracts power spectral density features across Delta (1–4 Hz), Theta (4–8 Hz), Alpha (8–13 Hz), Beta (13–30 Hz), and Gamma (30–45 Hz) bands.
3. **EEGNet (`eegnet.keras`, Weight: 0.10)**:
   * Uses depthwise and separable convolutions specifically tailored for EEG neuroimaging.

**Decision Boundary**:
$$\text{Ensemble Score} = 0.60 \cdot P_{\text{CNN-Transformer}} + 0.30 \cdot P_{\text{PSD-XGBoost}} + 0.10 \cdot P_{\text{EEGNet}}$$
$$\text{Decision Threshold} = 0.49 \quad (\ge 0.49 \implies \text{ADHD}, < 0.49 \implies \text{Control})$$

Hot-reloading is supported: editing `models/ensemble_config.json` updates inference parameters live on disk without restarting the API service.

---

## 5. API Endpoints

* **`POST /api/predict`**: Predicts on uploaded single files, multiple files, or ZIP archives.
* **`POST /api/predict/batch`**: Alias for batch file prediction.
* **`POST /api/validate`**: Validates file integrity, bio-signal authenticity, channel availability, and sampling rate without running inference.
* **`GET /api/model/info`**: Returns model architecture, input/output tensor shapes, parameter counts, and active weights.
* **`GET /health` / `GET /api/health`**: Health check reporting model loading status and computation device (CPU/GPU).

---

## 6. Frontend Architecture & Direct UI Access

The frontend is a clinical-grade neuroscience interface built with **React 19**, **Vite**, **TypeScript**, **Three.js / React Three Fiber**, and **Tailwind CSS v4**.

* **Direct UI Presentation (`LandingPage.tsx`)**:
  - The preliminary multi-stage cinematic intro sequence (idle landing, exploded anatomical layer disassembly, and 3D head cap resolution) has been streamlined with smooth ~10s video playback and sequential scroll stagger cascades.
  - When accessing the application URL (`http://localhost:5173/`), the complete scientific interface is rendered immediately.
* **Integrated 4-Phase Landing Workflow**:
  1. **Fixed 3D Cortical Stage (`scene-hero`)**: Interactive Three.js cortical mesh with real-time lobe spotlighting (Frontal, Parietal, Temporal, Occipital) and 8-channel live 10-20 waveform microvolt stream telemetry.
  2. **10-20 Montage Explorer (`scene-montage`)**: Complete 19-channel electrode array visualization, frequency band selector (Delta, Theta, Alpha, Beta, Gamma), and ADHD TBR biomarker context with staggered reveal animations.
  3. **Ensemble Architecture Deep Dive (`scene-pipeline`)**: Interactive 3D `AuraTiltCard` cards detailing CNN-Transformer, Welch PSD + XGBoost, and EEGNet with one-click architecture image zoom inspection and mathematical fusion equations.
  4. **Neural Lab Diagnostic Workspace (`scene-lab`)**: Polymorphic drag-and-drop file upload, 7-tier pre-validation modal, 1-click clinical benchmark loaders, and instant batch/single file prediction telemetry.

---

## 7. Clinical Brain Recovery & Neuro-Care Hub (`/dashboard/neuro-care`)

The platform integrates a clinical recovery and neuroplasticity care system ([BrainRecoveryPage.tsx](file:///d:/srkarthikeya1805%20ps_adhd_2026%20main%20adhd_backend/frontend/src/pages/BrainRecoveryPage.tsx)) addressing the neuro-biological foundations of ADHD:

1. **Interactive 19-Channel Neuro-Pathology Inspection Modal**:
   * Live simulated multichannel EEG wave visualizer rendering real-time oscillating potentials across **Delta (1–4 Hz)**, **Theta (4–8 Hz)**, **Alpha (8–12 Hz)**, **SMR (12–15 Hz)**, and **Fast Beta (13–30 Hz)** bands.
   * Scalp hotspot mapping linking 10-20 electrodes to cortical dysregulation:
     * **Prefrontal Executive Network (DLPFC - Fp1, Fp2, Fz, F3, F4)**: Highlights high theta excess, dopamine transporter (DAT1) clearance, and working memory fatigue.
     * **Fronto-Striatal Dopaminergic Circuit (F3, F4, C3, C4)**: Reward deficiency encoding and delayed executive task engagement.
     * **Sensorimotor Strip (C3, Cz, C4)**: Somatic motor gating, tactile restlessness, and depleted 12–15 Hz Sensorimotor Rhythm (SMR).
2. **4-Tier Clinical Intervention Protocols**:
   * **Tier 1: SMR Neurofeedback & Cortical Training**: Clinical Operant conditioning protocol targeting 12–15 Hz rhythm enhancement over the central strip ($Cz, C3, C4$) to reduce involuntary motor fidgeting.
   * **Tier 2: Dopaminergic Prefrontal Rest & Cognitive Pacing**: Non-Sleep Deep Rest (NSDR 15–20 min), structured 25/5 Pomodoro cycles to prevent prefrontal glycogen depletion, and dopamine baseline stabilization.
   * **Tier 3: Circadian Sleep Architecture & Glymphatic Cleansing**: Optimizing slow-wave sleep (Stage 3 NREM) and glymphatic metabolic waste clearance to lower morning theta excess and executive brain fog.
   * **Tier 4: Multi-Modal Nutritional & Lifestyle Support**: Precursor nutrition (L-Tyrosine, Magnesium L-Threonate), morning high-lux sunlight retinal exposure, and high-intensity aerobic exercise promoting Brain-Derived Neurotrophic Factor (BDNF).
3. **Interactive Audio Biofeedback & Visual Diagnostic Imagery**:
   * Real-time audio frequency synthesis via Web Audio API (`neuroAudio`) for auditory cueing during neural training.
   * High-resolution medical diagnostic imagery illustrating synaptic vesicle dopamine release, SMR electrode placement, deep-sleep EEG delta waves, and ADHD vs. Control spectral contrasts.

---

## 8. Enhanced 3D Scalp Topography & Signal Explorer (`/dashboard/signal-explorer`)

The Signal Explorer ([SignalExplorerPage.tsx](file:///d:/srkarthikeya1805%20ps_adhd_2026%20main%20adhd_backend/frontend/src/pages/SignalExplorerPage.tsx)) provides real-time 10-20 inspection:
* **3D Scalp Electrode Topography Showcase**: Integrated `AuraTiltCard` rendering 3D scalp montage geometry with live ±50 μV potential telemetry and corner status monitors.
* **Continuous Real-Time Waveform Monitors**: Three dedicated wave monitors for Slow Potentials (1–4 Hz Delta), Theta/Alpha (4–12 Hz Sensory Rhythms & TBR), and Fast Beta (13–30 Hz Active Focus).
* **Interactive 19-Channel Electrode Selector**: Quick selection across all 19 standard electrodes (Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2) displaying specific cortical lobe mapping, microvolt amplitude range, ADHD biomarker impact, and clinical significance.
* **Adjustable Telemetry Controls**: Multichannel trace zoom ($0.5\times$ to $5\times$), timebase scroll speeds, individual channel soloing, and live frequency bandpower calculations.


---

## 9. BCI Competition / Motor Imagery Gating & Dataset Compatibility Standards

### 9.1 Why BCI Competition Datasets (BCICIV_1, BCICIV_2a, BCICIV_2b) Are Formally Rejected
The platform is calibrated specifically for **clinical EEG ADHD detection** and enforces strict biological and montage prerequisites:

1. **Experimental Paradigm Mismatch**:
   - **BCI Competition IV (e.g. `BCICIV_2a_gdf.zip`)**: Records brain activity during cued **motor imagery** (mental simulation of left hand, right hand, foot, and tongue movements).
   - **Clinical ADHD Protocol**: Evaluates resting-state (Eyes-Open / Eyes-Closed) or continuous performance attention tasks (CPT) to quantify sustained cognitive focus, tonic arousal, and prefrontal dopamine gating.

2. **Severe Electrode Montage Incompatibility**:
   - **BCICIV 2a**: Contains 22 EEG electrodes focused tightly around the sensorimotor cortex ($C3, Cz, C4$) + 3 monopolar EOG channels.
   - **Montage Deficit**: Completely lacks **13 of the 19 standard clinical 10-20 channels**, including all prefrontal and frontal leads ($Fp1, Fp2, F7, F3, Fz, F4, F8$) and temporal leads ($T3, T4, T5, T6$).
   - **Clinical Consequence**: ADHD biomarkers fundamentally reside in prefrontal cortex dysregulation (elevated frontal Theta, depleted Beta, fronto-striatal Theta/Beta Ratio exceeding 3.0). Attempting ADHD classification on motor cortex channels without frontal leads generates medically spurious, invalid diagnostics.

3. **Subagent Multi-Tier Interception**:
   - `BioAuthenticator` (Tier 0B): Detects BCI motor imagery signatures, `.gdf` archive structures, and channel deficits.
   - `Dispatcher`: Halts prediction pipeline, marks status as `Prediction Withheld`, and generates transparent clinical research protocol advisories.

---

## 10. Frontend Architecture, Custom Neuroscience Typography & Interactive Bulging Engine

### 10.1 Typography Suite
- **Navigation & Telemetry Font (`Oxanium` / `Orbitron`)**: Distinctive, angular high-tech writing style font providing an aerospace/neuro-clinical command center aesthetic.
- **Headings & Brand Title (`Space Grotesk` / `Syne`)**: Clean, authoritative neo-grotesque display typography.
- **Body & Explanatory Prose (`Plus Jakarta Sans`)**: High-legibility geometric sans-serif for clinical readability.
- **Telemetry & Data Tables (`JetBrains Mono`)**: Fixed-width clarity for numerical arrays, frequency ranges, and coordinates.

### 10.2 Universal Interactive Bulging Hover Engine
- Configured across `src/index.css`, `Button.tsx`, and `LandingPage.tsx` using spring physics (`cubic-bezier(0.34, 1.56, 0.64, 1)`):
  - **Buttons & Pills**: Expand by $+6\%$ to $+10\%$ (`scale(1.06) - scale(1.10)`) with ambient cyan drop-shadow on cursor hover.
  - **10-20 Scalp Electrode Grid**: Individual channel nodes expand by $+22\%$ (`scale(1.22) translateY(-3px)`) with glowing cyan saturation.
  - **Feature Cards & Table Containers**: Expand by $+3.5\%$ with deep glass shadow elevation.
  - **Tactile Active Press**: Smooth spring compression to `scale(0.96)` on mouse click.
- **Enhanced Contrast Notice Boxes**: High-opacity solid dark glass backing (`bg-[#070e1e]/95` with `backdrop-blur-2xl`) and enlarged 16px–20px typography preventing background particle bleed-through.
