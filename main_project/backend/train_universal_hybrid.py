"""
Multi-Cohort Universal Hybrid Deep Learning Training Pipeline.
Trains and fine-tunes the CNN-Transformer across all available EEG datasets:
- IEEE Dataport (Pediatric visual attention task)
- Mendeley Data (Adult resting and task-based 2-channel cohort)
- Nature / RepOD Raw_data (Adult multi-paradigm cognitive conflict tasks)
"""

import os
import sys
import zipfile
import tempfile
from pathlib import Path
from typing import List, Tuple
import numpy as np

# Ensure backend modules can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import MODELS_DIR, TARGET_FS, WINDOW_SAMPLES
from app.parsers.mat_parser import read_mat_file
from app.preprocessing import process_eeg_recording
from app.model.model_loader import ModelManager, PositionalEmbedding
from app.model.inference import psd_features


def load_dataset_windows(
    zip_path: Path,
    dataset_name: str,
    max_files: int = 50,
    windows_per_file: int = 20
) -> Tuple[np.ndarray, np.ndarray]:
    """Extract preprocessed 10-second EEG windows and binary labels from a dataset archive."""
    print(f"\n[LOADER] Scanning dataset: {dataset_name} ({zip_path.name})...")
    if not zip_path.exists():
        print(f"  [WARN] Dataset archive not found: {zip_path}")
        return np.empty((0, WINDOW_SAMPLES, 19)), np.empty((0,))

    all_windows = []
    all_labels = []

    with zipfile.ZipFile(zip_path, "r") as z:
        mats = [n for n in z.namelist() if n.endswith(".mat") and not Path(n).stem.lower().startswith(("y_", "sub_", "chan"))]
        
        # Balance sample selection
        adhd_files = [n for n in mats if "adhd" in n.lower()]
        ctrl_files = [n for n in mats if any(c in n.lower() for c in ["control", "ctrl", "fc", "mc"])]
        
        selected = adhd_files[:max_files // 2] + ctrl_files[:max_files // 2]
        if not selected:
            selected = mats[:max_files]

        for name in selected:
            is_adhd = 1 if "adhd" in name.lower() else 0
            with tempfile.NamedTemporaryFile(suffix=".mat", delete=False) as tmp:
                tmp.write(z.read(name))
                tmp_p = Path(tmp.name)
            try:
                rec = read_mat_file(tmp_p)
                X, _, _, _, _ = process_eeg_recording(rec)
                if len(X) > windows_per_file:
                    indices = np.linspace(0, len(X) - 1, windows_per_file, dtype=int)
                    X = X[indices]
                all_windows.append(X)
                all_labels.extend([is_adhd] * len(X))
                print(f"  Loaded {name} -> {len(X)} windows (Class: {'ADHD' if is_adhd else 'Control'})")
            except Exception as e:
                print(f"  [SKIP] Could not load {name}: {e}")
            finally:
                if tmp_p.exists(): tmp_p.unlink()

    if all_windows:
        X_out = np.concatenate(all_windows, axis=0).astype(np.float32)
        y_out = np.array(all_labels, dtype=np.float32)
        print(f"[LOADER] {dataset_name} loaded: X={X_out.shape}, ADHD={int(sum(y_out))}, Control={int(len(y_out)-sum(y_out))}")
        return X_out, y_out
    return np.empty((0, WINDOW_SAMPLES, 19)), np.empty((0,))


def main():
    print("=" * 70)
    print("UNIVERSAL MULTI-DATASET HYBRID DEEP LEARNING MODEL TRAINING PIPELINE")
    print("=" * 70)

    datasets_dir = Path(__file__).resolve().parent / "Datasets"

    # 1. Load multi-cohort data
    ieee_zip = datasets_dir / "ADHD_EEG_19ch_128Hz_Colab_Ready.zip"
    mendeley_zip = datasets_dir / "MENDELY_ADHD.zip"
    raw_zip = datasets_dir / "Raw_data.zip"

    X_ieee, y_ieee = load_dataset_windows(ieee_zip, "IEEE Pediatric", max_files=40, windows_per_file=15)
    X_mendeley, y_mendeley = load_dataset_windows(mendeley_zip, "Mendeley Adult", max_files=4, windows_per_file=50)
    X_raw, y_raw = load_dataset_windows(raw_zip, "Nature/RepOD Adult Tasks", max_files=30, windows_per_file=15)

    all_X = [X for X in [X_ieee, X_mendeley, X_raw] if len(X) > 0]
    all_y = [y for y in [y_ieee, y_mendeley, y_raw] if len(y) > 0]

    if not all_X:
        print("[ERROR] No training datasets could be extracted.")
        return

    X_all = np.concatenate(all_X, axis=0)
    y_all = np.concatenate(all_y, axis=0)

    # Shuffle dataset
    idx = np.random.permutation(len(y_all))
    X_all = X_all[idx]
    y_all = y_all[idx]

    print("\n--- Consolidated Multi-Cohort Dataset ---")
    print(f"Total Windows: {len(X_all)}")
    print(f"ADHD Windows:    {int(sum(y_all))} ({sum(y_all)/len(y_all)*100:.1f}%)")
    print(f"Control Windows: {int(len(y_all) - sum(y_all))} ({(1-sum(y_all)/len(y_all))*100:.1f}%)")

    # 2. Load existing CNN-Transformer model
    models = ModelManager.get_models()
    cnn_model = models["cnn_transformer"]

    import tensorflow as tf
    cnn_model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss=tf.keras.losses.BinaryCrossentropy(label_smoothing=0.05),
        metrics=["accuracy", tf.keras.metrics.AUC(name="auc")]
    )

    print("\n[TRAINING] Fine-tuning CNN-Transformer on multi-cohort EEG windows...")
    history = cnn_model.fit(
        X_all, y_all,
        batch_size=32,
        epochs=5,
        validation_split=0.20,
        verbose=1
    )

    out_model_path = MODELS_DIR / "cnn_transformer.keras"
    cnn_model.save(out_model_path)
    print(f"[SUCCESS] Multi-cohort Hybrid model saved to: {out_model_path}")

    # 3. Fit Welch PSD + XGBoost
    from sklearn.preprocessing import StandardScaler
    from xgboost import XGBClassifier
    import joblib

    print("\n[TRAINING] Extracting Welch PSD features for XGBoost...")
    F_all = np.stack([psd_features(w, TARGET_FS) for w in X_all])
    scaler = StandardScaler()
    F_scaled = scaler.fit_transform(F_all)

    xgb = XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05, eval_metric="logloss")
    xgb.fit(F_scaled, y_all)

    joblib.dump(scaler, MODELS_DIR / "psd_scaler.joblib")
    xgb.save_model(MODELS_DIR / "xgboost.json")
    print("[SUCCESS] Multi-cohort Scaler & XGBoost model saved successfully.")

    print("\n" + "=" * 70)
    print("TRAINING COMPLETE: All models fine-tuned across multi-cohort EEG datasets!")
    print("=" * 70)


if __name__ == "__main__":
    main()
