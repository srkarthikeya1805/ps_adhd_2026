# Hybrid Deep Learning Model Using EEG to Detect ADHD

An end-to-end multi-model deep learning and ensemble framework for automated detection and classification of Attention-Deficit/Hyperactivity Disorder (ADHD) using multichannel electroencephalography (EEG) recordings.

---

## 📌 Overview

Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder typically identified through clinical interviews and behavioural observations. This project explores non-invasive physiological EEG recordings across multi-channel montages to provide reproducible, subject-independent decision support.

The framework integrates three complementary branches:
1. **CNN + Transformer**: Captures local morphological features via 1D convolutions and temporal dependencies across long sequences via multi-head self-attention.
2. **EEGNet**: A lightweight, compact architecture specialized for EEG brain-computer interfaces combining temporal, depthwise spatial, and separable convolutions.
3. **PSD + XGBoost**: Frequency-domain representation extracting relative power spectral densities (Delta, Theta, Alpha, Beta, Gamma) combined with gradient boosting.
4. **Ensemble Fusion**: Weighted probability aggregation across branches for robust subject-level ADHD vs. Control predictions.

---

## 🏗️ System Architecture

```
EEG Recording (19 channels) 
        ↓
Input Validation & 19-Channel Alignment
        ↓
Resampling (128 Hz) & Band-Pass Filtering (1–45 Hz) + CAR + Artifact Suppression
        ↓
Windowing (4-second windows, 50% overlap)
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Parallel Model Branches                     │
├───────────────────────────────┬─────────────────┬───────────────┤
│       CNN + Transformer       │     EEGNet      │ PSD + XGBoost │
│   (Local & Long-range Temporal)│(Spatial/Temporal)│ (Power Bands) │
└───────────────┬───────────────┴────────┬────────┴───────┬───────┘
                │                        │                │
                └────────────────────────┼────────────────┘
                                         ↓
                            Ensemble Probability Fusion
                                         ↓
                          Subject-Level ADHD / Control
```

---

## 📂 Repository Structure

```
PS_ADHD_2026/
├── ADHD_EEG_CNN_Transformer_EEGNet_PSD_XGBoost_Ensemble_Colab (1).ipynb  # Complete Google Colab Pipeline
├── ADHD_Base_RP.pdf                                                    # Reference Research Paper
├── ADHD_EEG_Milestone1_Final_Presentation.pptx                         # Project Presentation Slide Deck
├── ADHD_EEG_Milestone1_Detailed_7_Slide_PPT_Content.docx               # Presentation Content Documentation
├── Final_Reseach_Paper.md                                              # Complete Paper Manuscript
├── architecture_diagram.png                                            # Pipeline Architecture Diagram
├── adhd_backend_updated.zip                                            # Backend API / Service Archive
│
├── models/                                                             # Trained Models & Preprocessing Artifacts
│   ├── adhd_cnn_transformer_model.keras                                # CNN-Transformer Checkpoint
│   ├── cnn_transformer.keras                                           # Trained CNN-Transformer
│   ├── eegnet.keras                                                    # Trained EEGNet Model
│   ├── xgboost.json                                                    # Trained XGBoost Booster
│   ├── psd_scaler.joblib                                               # Fitted StandardScaler for PSD Features
│   ├── ensemble_config.json                                            # Ensemble Weights & Optimal Threshold
│   └── README.txt                                                      # Model Metadata & Loading Guide
│
├── DataSets/                                                           # Dataset Documentation & Samples
│   ├── datasets.md                                                     # Public Dataset Sources & Download Instructions
│   ├── ADHD_EEG_19ch_128Hz_Colab_Ready.zip                             # Processed 19-channel Benchmark Sample
│   └── MENDELY_ADHD.zip                                                # Mendeley ADHD Benchmark Sample
│
├── IMP_ITEMS/                                                          # Project Reports, Abstract & Media
│   ├── ADHD_ROADMAP.docx                                               # Project Roadmap Document
│   ├── FINAL_ABSTRACT_K.docx                                           # Research Abstract
│   └── The_AI_Detective.mp4                                            # Explanatory Overview Video
│
└── Reseach_Papers/                                                     # Background Literature & References
    └── s41597-026-06758-7.pdf
```

---

## 📊 Datasets & Preprocessing

The model uses publicly available benchmark EEG datasets:
1. **IEEE DataPort**: EEG Data for ADHD / Control Children (121 participants, 19 channels, 128 Hz).
2. **Mendeley Data**: Adults with ADHD and Healthy Controls (79 participants, 5 channels).
3. **Figshare**: Working Memory and Response Inhibition in ADHD (59 participants).

> **Note on Datasets**: For full download links and data access guidelines, refer to [`DataSets/datasets.md`](DataSets/datasets.md). The large raw data archives (>100MB) are kept outside the repository per GitHub guidelines and can be downloaded from their original repositories.

### Preprocessing Pipeline:
- **Resampling**: Standardized to 128 Hz.
- **Filtering**: 50 Hz Notch filter + 1–45 Hz Band-pass filter (Butterworth 4th-order).
- **Referencing**: Common Average Referencing (CAR).
- **Artifact Suppression**: Median / MAD-based artifact screening and channel standardisation.
- **Windowing**: 4-second epochs (512 samples) with 50% overlap.
- **Subject-Independent Splitting**: Strict participant-level separation prior to epoch generation to eliminate data leakage.

---

## 🚀 Getting Started

### 1. Running the Google Colab Notebook
Open [`ADHD_EEG_CNN_Transformer_EEGNet_PSD_XGBoost_Ensemble_Colab (1).ipynb`](./ADHD_EEG_CNN_Transformer_EEGNet_PSD_XGBoost_Ensemble_Colab%20(1).ipynb) directly in Google Colab to run the complete training, validation, and evaluation pipeline with GPU acceleration.

### 2. Loading Pretrained Models
```python
import json
import joblib
import tensorflow as tf
import xgboost as xgb

# 1. Load Deep Learning Models
cnn_transformer = tf.keras.models.load_model("models/cnn_transformer.keras")
eegnet = tf.keras.models.load_model("models/eegnet.keras")

# 2. Load XGBoost Model & Scaler
xgb_model = xgb.XGBClassifier()
xgb_model.load_model("models/xgboost.json")
psd_scaler = joblib.load("models/psd_scaler.joblib")

# 3. Load Ensemble Configuration
with open("models/ensemble_config.json", "r") as f:
    ensemble_cfg = json.load(f)
print("Ensemble Weights:", ensemble_cfg)
```

---

## 📈 Evaluation Metrics

The models are evaluated at the subject level using:
- **Accuracy & Balanced Accuracy**
- **Precision, Sensitivity (Recall), Specificity**
- **F1-Score and F2-Score** (prioritizing recall to minimize false negatives in clinical screening)
- **ROC-AUC & Confusion Matrix**

---

## 📜 Citation & References

```bibtex
@article{chugh2024hybrid,
  title={The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG},
  author={Chugh, N. and Aggarwal, S. and Balyan, A.},
  journal={Clinical EEG and Neuroscience},
  volume={55},
  number={1},
  pages={22--33},
  year={2024}
}
```
*For additional references, consult [Final_Reseach_Paper.md](Final_Reseach_Paper.md).*
