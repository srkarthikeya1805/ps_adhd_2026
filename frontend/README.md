# 🧠 NeuroScan AI — Frontend

A state-of-the-art, cinematic neuroscience web application built with **React 19**, **Vite**, **TypeScript**, **Three.js / React Three Fiber**, **Tailwind CSS v4**, **Framer Motion**, and **Recharts**.

NeuroScan AI pairs directly with the [Universal EEG ADHD Detection Backend](file:///d:/srkarthikeya1805%20ps_adhd_2026%20main%20adhd_backend/README.md) to provide clinical researchers, computational neuroscientists, and lab evaluators with real-time bio-signal validation, multi-model ensemble predictions, 19-channel 10-20 waveform exploration, and cohort concordance telemetry.

---

## 🌟 Key Application Features

### 1. Procedural 3D Interactive Brain (`src/components/BrainCanvas.tsx`)
* **Dynamic Geometry**: Custom procedural dual-hemisphere 3D mesh with gyri-like surface displacement, glowing vertex shaders (cyan, electric blue, violet, magenta), and atmospheric point lights.
* **Synaptic Filaments & Electrical Pulses**: Travelling particle nodes propagate along synaptic curves across cortical lobes.
* **Hemispheric Fissure Separation**: Dual-hemisphere separation and reconnection animation revealing internal neural structures.
* **Interactive Cortical Lobes**: Real-time hover and click inspection for Frontal, Parietal, Temporal, and Occipital lobes with anatomical descriptions and ADHD neuro-developmental correlations.
* **Resilient Architecture**: Automated WebGL context-loss recovery and seamless 2D canvas fallback (`BrainFallback.tsx`) for low-end hardware or virtualized environments.
* **Accessible Motion**: Instant **Skip Intro** control and built-in `prefers-reduced-motion` detection.

### 2. Multi-Tier Bio-Signal Validation & Rejection Alerts (`src/pages/BatchResultsPage.tsx`, `UploadPage.tsx`)
* **Strict Biological Signal Gating**: When non-signal metadata (`trial_sequence.zip`), non-ADHD motor imagery paradigms (`BCICIV_1_mat.zip`), or incompatible sparse montages lacking standard 10-20 channels (`MENDELY_ADHD.zip`) are uploaded, the UI halts prediction and displays prominent clinical rejection banners.
* **Exact Reason Diagnostics**: Clear diagnostic feedback explaining why recordings were rejected (e.g. *BCI Motor Imagery Paradigm*, *Incompatible Montage (<19 channels)*, or *Flatline / Zero-Variance Signal*).

### 3. Clinical Cohort Concordance Telemetry (`src/pages/BatchResultsPage.tsx`)
* **Live Concordance KPI Grid**:
  * **Concordance Rate**: Overall percentage of model predictions matching clinical diagnostic tables.
  * **Concordant vs. Discordant Files**: Highlighting validated clinical agreement.
  * **Sensitivity (ADHD Recall)**: True Positive rate across verified ADHD cohorts.
  * **Specificity (Control Recall)**: True Negative rate across healthy control groups.
* **Interactive Ground Truth Table**:
  * Displays detected Reference Cohort Ground Truth alongside Live Model Predictions.
  * Color-coded status badges: `Concordant` (emerald green) vs `Discordant` (amber/crimson).
  * Direct drill-down link to single-recording window timelines and probability gauges.

### 4. 3-Model Hybrid Deep Learning Suite (`src/pages/ModelEnsemblePage.tsx`)
* **Calibrated Model Weights**:
  * **CNN-Transformer (60% Weight)**: 1D Temporal Convolutions + Multi-Head Self-Attention Transformer Head capturing long-range temporal dependencies.
  * **Welch PSD + XGBoost (30% Weight)**: Gradient-boosted decision trees over Delta, Theta, Alpha, Beta, and Gamma frequency bandpowers.
  * **EEGNet (10% Weight)**: Compact spatio-temporal depthwise and separable convolutions.
* **Decision Boundary**:
  $$\text{Ensemble Probability} = 0.60 \times P_{\text{CNN-Transformer}} + 0.30 \times P_{\text{PSD-XGBoost}} + 0.10 \times P_{\text{EEGNet}}$$
  $$\text{Decision Threshold} = 0.49 \quad (\ge 0.49 \implies \text{ADHD}, < 0.49 \implies \text{Control})$$
* **Scientific Transparency**: Clear demarcation between configured ensemble voting weights and empirical model accuracy.

### 5. Multi-Channel Signal Waveform Explorer (`src/pages/SignalExplorerPage.tsx`)
* **19-Channel 10-20 Montage**: Interactive multichannel trace viewer displaying all standard electrodes (Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2).
* **Signal Telemetry Controls**: Amplitude gain scaling ($0.5\times$ to $5\times$), timebase speed adjustment, individual channel toggle filters, and real-time playback animation.
* **Spectral Band Energy Profiler**: Real-time telemetry across Delta (0.5–4 Hz), Theta (4–8 Hz), Alpha (8–13 Hz), Beta (13–30 Hz), and Gamma (30–45 Hz) bands with Frontal Theta/Beta Ratio (TBR).

### 6. 10-Stage Pipeline Visualizer (`src/pages/PipelineDiagram.tsx`)
* Interactive node diagram visualizing the complete biomedical signal processing sequence:
  1. Universal File Parsing (.mat, .edf, .bdf, .gdf, .csv, .tsv, .npy, .zip)
  2. Multi-Tier Bio-Signal Authenticator (Tiers 0–7)
  3. Channel Harmonization & 10-20 Scalp Mapping
  4. Polyphase Rational Resampling to 128.0 Hz
  5. 4th-Order Butterworth Bandpass (1.0–45.0 Hz) & 50 Hz Notch Filtering
  6. Per-Channel Z-Score Normalization
  7. Developmental Spectral Profiling (IAF & TBR)
  8. 10-Second Temporal Segmentation (1280 samples, 50% overlap)
  9. Multi-Model Inference (CNN-Transformer, EEGNet, PSD-XGBoost)
  10. Calibrated Ensemble Classification & Telemetry Reporting

---

## 🛠️ Technology Stack

| Domain | Libraries & Frameworks |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), Glassmorphism design tokens |
| **3D Graphics** | [Three.js](https://threejs.org/), [React Three Fiber](https://r3f.docs.pmnd.rs/), [React Three Drei](https://github.com/pmndrs/drei) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Data Visualization** | [Recharts](https://recharts.org/), Custom SVG Canvas visualizers |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Routing & State** | [React Router v7](https://reactrouter.com/), Context API, LocalStorage persistence |

---

## 📁 Frontend Project Structure

```text
frontend/
├── src/
│   ├── assets/                # Static brand logos, icons, and textures
│   ├── components/            # Reusable UI component library
│   │   ├── BrainCanvas.tsx    # Three.js 3D procedural interactive brain
│   │   ├── BrainFallback.tsx  # Resilient WebGL failure / 2D canvas fallback
│   │   ├── Navbar.tsx         # Responsive glassmorphism navigation header
│   │   ├── Footer.tsx         # Clinical disclaimer and system metadata footer
│   │   ├── CinematicLoadingOverlay.tsx # 5-stage animated analysis sequence
│   │   ├── NeuralTimeline.tsx # Window-by-window 10s segmentation timeline
│   │   ├── PipelineDiagram.tsx # 10-stage architecture node graph
│   │   └── ProbabilityGauge.tsx # Animated SVG probability meter
│   │
│   ├── pages/                 # Full-page route views
│   │   ├── LoginPage.tsx      # Research demo login & guest access
│   │   ├── DashboardOverviewPage.tsx # System health, status, & telemetry
│   │   ├── UploadPage.tsx     # File uploader & pre-validation inspector
│   │   ├── ResultsPage.tsx    # Single recording analysis & window charts
│   │   ├── BatchResultsPage.tsx # Cohort concordance telemetry & ground truth table
│   │   ├── ModelEnsemblePage.tsx # 3-model weights, equations & architecture
│   │   ├── SignalExplorerPage.tsx # 19-channel waveform viewer & PSD telemetry
│   │   ├── HistoryPage.tsx    # Persistent session analysis history
│   │   └── SettingsPage.tsx   # API endpoint diagnostics & latency monitor
│   │
│   ├── services/
│   │   └── api.ts             # Typed Axios client & backend REST integrations
│   │
│   ├── types/
│   │   └── eeg.ts             # Pydantic-mirrored TypeScript interfaces
│   │
│   ├── App.tsx                # Route provider & global notification context
│   ├── main.tsx               # Application bootstrap
│   └── index.css              # Tailwind v4 theme, fonts, and glassmorphism tokens
│
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Dev server configuration with backend proxy
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* Running backend instance at `http://127.0.0.1:8000` (see root [README.md](file:///d:/srkarthikeya1805%20ps_adhd_2026%20main%20adhd_backend/README.md))

### 1. Install Dependencies
```powershell
cd frontend
npm install
```

### 2. Launch Development Server
```powershell
npm run dev
```
The application will launch at `http://localhost:5173`.  
All API calls directed to `/api` or `/health` are automatically proxied to `http://127.0.0.1:8000` via `vite.config.ts`.

### 3. Production Build
```powershell
# Type check and build optimized bundle:
npm run build

# Preview production build locally:
npm run preview
```

---

## ⚖️ Academic Research Disclaimer
*NeuroScan AI is an academic research prototype designed for computational neuroscience and signal processing exploration. It provides AI-assisted pattern recognition and does not constitute a clinical medical device or medical diagnosis. All clinical decisions must be made by qualified healthcare professionals.*
