# 🧠 NeuroScan AI — Universal EEG ADHD Detection Platform

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js-black?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TensorFlow](https://img.shields.io/badge/Deep%20Learning-TensorFlow%20%2F%20Keras-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)

Production and research-grade deep learning system for objective identification of **Attention-Deficit/Hyperactivity Disorder (ADHD)** from multi-format Electroencephalogram (EEG) recordings.

---

## 📁 Project Architecture & Clean Folder Layout

This project is strictly organized into clean, dedicated modules:

```text
NeuroScan_ADHD_2026/
├── backend/                              # Complete FastAPI Python Backend
│   ├── app/                              # Core API, parsers, models, and subagents
│   │   ├── api/                          # REST route handlers (/health, /api/predict, /api/model/info)
│   │   ├── model/                        # PositionalEmbedding layer & ModelManager loader
│   │   ├── parsers/                      # Multi-format parsers (.mat, .csv, .tsv, .npy, .edf, .zip)
│   │   ├── preprocessing/                # 10-20 mapping, polyphase resampling (128Hz), filtering (1-45Hz)
│   │   ├── schemas/                      # Pydantic telemetry & response definitions
│   │   ├── subagents/                    # Bio-authenticator, dispatcher, preprocessor, reporter
│   │   ├── utils/                        # Logging and filesystem validation guards
│   │   ├── validation/                   # Signal and tensor shape validators
│   │   ├── config.py                     # Pipeline constants and channel aliases
│   │   └── main.py                       # FastAPI application factory
│   ├── models/                           # Trained ML model weights and configs
│   │   ├── adhd_cnn_transformer_model.keras
│   │   ├── cnn_transformer.keras         # 1D Temporal CNN + Multi-Head Self-Attention
│   │   ├── eegnet.keras                  # Spatio-temporal depthwise/separable model
│   │   ├── xgboost.json                  # Welch PSD gradient boosted classifier
│   │   ├── psd_scaler.joblib             # Feature standardizer
│   │   └── ensemble_config.json          # Calibrated model weights & decision threshold
│   ├── tests/                            # 41 automated unit and integration tests
│   ├── main.py                           # Root server entrypoint (python main.py)
│   ├── predict.py                        # Standalone CLI prediction utility
│   ├── train_universal_hybrid.py         # Multi-dataset fine-tuning pipeline
│   ├── create_alpha_brain.py             # Brain visualization helper
│   ├── requirements.txt                  # Python dependencies
│   └── README.md                         # Dedicated backend architecture guide
│
├── frontend/                             # Cinematic React 19 + Three.js Application
│   ├── public/                           # Static assets and icons
│   ├── src/                              # Source code
│   │   ├── assets/                       # Scientific imagery and 3D icons
│   │   ├── components/                   # Interactive 3D brain, HUD telemetry, Recharts
│   │   ├── pages/                        # Landing, Upload, BatchResults, SignalExplorer, Ensemble
│   │   ├── services/                     # Typed API client and local storage telemetry
│   │   ├── types/                        # TypeScript definitions
│   │   ├── App.tsx                       # Root routing and layout
│   │   └── main.tsx                      # Vite React mounting point
│   ├── index.html                        # HTML template with Space Grotesk / JetBrains typography
│   ├── package.json                      # Pinned npm dependencies
│   ├── vite.config.ts                    # Vite + Tailwind CSS v4 configuration
│   ├── tsconfig.json                     # TypeScript configuration
│   └── README.md                         # Dedicated frontend design guide
│
├── datasets/                             # EEG Datasets & Benchmark Recordings
│   ├── ADHD_EEG_19ch_128Hz_Colab_Ready.zip
│   ├── MENDELY_ADHD.zip
│   └── datasets.md
│
├── research_papers/                      # Reference Literature & Scientific Research
│   ├── ADHD_Base_RP.pdf                  # Primary reference research paper
│   ├── Final_Reseach_Paper.md            # Comprehensive research documentation
│   └── [35+ Reference Research PDFs]     # Clinical and deep learning studies
│
├── project_documents/                    # Project Milestones, Reviews, & Deliverables
│   ├── presentations/                    # Milestone PPTX decks and content outlines
│   ├── reports_and_abstracts/            # Final project abstracts and roadmaps
│   └── architecture_and_charts/          # Architecture diagram and comparative tables
│
├── media_and_animations/                 # Visual Demonstration & Animation Assets
│   ├── videos/                           # 3D brain disassembly animations & MP4 clips
│   ├── reference_frames/                 # Extracted frame sequences and render references
│   └── screenshots/                      # Telemetry benchmarks and capture previews
│
├── PROJECT_CONTEXT.md                    # In-depth architectural & scientific context
└── README.md                             # This master project guide
```

---

## ⚡ Quickstart: Running the Application

### 1. Start Backend (FastAPI)

```powershell
# Navigate to the backend directory:
cd backend

# Create and activate virtual environment (optional but recommended):
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies:
pip install -r requirements.txt

# Start the server:
python main.py
```
* **Backend API**: `http://127.0.0.1:8000`
* **Swagger Documentation**: `http://127.0.0.1:8000/docs`
* **Health Check**: `http://127.0.0.1:8000/api/health`

---

### 2. Start Frontend (React 19 + Vite)

```powershell
# In a separate terminal, navigate to frontend:
cd frontend

# Install npm dependencies:
npm install

# Start Vite dev server:
npm run dev
```
* **Web UI**: `http://localhost:5173`

---

## 🔬 Calibrated 3-Model Ensemble

The platform classifies ADHD using a calibrated tri-model ensemble with a decision threshold of **0.49**:

$$P_{\text{ensemble}} = 0.60 \times P_{\text{CNN-Transformer}} + 0.30 \times P_{\text{PSD-XGBoost}} + 0.10 \times P_{\text{EEGNet}}$$

* **CNN-Transformer (60%)**: 1D temporal convolutions combined with multi-head self-attention mechanisms.
* **Welch PSD + XGBoost (30%)**: Power Spectral Density density across Delta (0.5–4 Hz), Theta (4–8 Hz), Alpha (8–13 Hz), Beta (13–30 Hz), and Gamma (30–45 Hz).
* **EEGNet (10%)**: Depthwise and separable spatio-temporal convolutions for neural cadence extraction.

---

## 🛡️ 7-Tier Biological Signal Authenticator

Uploaded recordings are rigorously evaluated before running inference to prevent false classifications:
1. **Tier 0A**: Shape & length verification ($\ge 128$ samples, non-empty, finite).
2. **Tier 0B**: BCI Motor Imagery paradigm detection (rejects hand/foot motor movement datasets).
3. **Tier 1**: Flatline & dead channel detection ($\sigma < 10^{-6}$).
4. **Tier 2**: Dynamic voltage saturation check ($> 10,000\,\mu\text{V}$).
5. **Tier 3**: Entropy & white noise rejection.
6. **Tier 4**: Physiological $1/f$ pink-noise spectral decay verification.
7. **Tier 5**: Non-biological monotonic ramp and discrete code detection.
8. **Tier 6**: High-frequency synthetic clock-tick rejection.
9. **Tier 7**: Clinical 19-channel 10-20 scalp montage compatibility.

---

## ⚖️ Academic Research Disclaimer

*NeuroScan AI is an academic research and engineering prototype designed for computational neuroscience, signal processing, and machine learning exploration. It does not constitute a certified medical diagnostic device. All clinical evaluations must be conducted by qualified healthcare professionals.*

