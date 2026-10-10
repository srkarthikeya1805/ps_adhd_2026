import logging
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import tensorflow as tf
from tensorflow import keras

from app.config import (
    MODEL_CHANNEL_NAMES,
    REQUIRED_CHANNELS,
    TARGET_FS,
    WINDOW_SAMPLES,
    WINDOW_SECONDS,
    get_model_path,
)
from app.utils.logging import logger, log_pipeline_step


# ============================================================
# POSITIONAL EMBEDDING CUSTOM LAYER
# ============================================================

@keras.utils.register_keras_serializable()
class PositionalEmbedding(keras.layers.Layer):
    """Positional embedding layer matching the trained CNN-Transformer architecture."""

    def __init__(self, max_len: int = 1280, d_model: int = 64, **kwargs):
        super().__init__(**kwargs)
        self.max_len = int(max_len)
        self.d_model = int(d_model)
        self.pos = self.add_weight(
            shape=(1, self.max_len, self.d_model),
            initializer="random_normal",
            trainable=True,
            name="pos"
        )

    def call(self, x: tf.Tensor) -> tf.Tensor:
        return x + self.pos[:, :tf.shape(x)[1], :]

    def get_config(self) -> Dict[str, Any]:
        config = super().get_config()
        config.update({
            "max_len": self.max_len,
            "d_model": self.d_model
        })
        return config


# ============================================================
# MULTI-MODEL MANAGER
# ============================================================
class ModelManager:
    _instance = None
    _models = None
    _device = "CPU"
    _config = None
    _scaler = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def detect_device(cls) -> str:
        if cls._device:
            return cls._device
        cls._device = "GPU" if tf.config.list_physical_devices("GPU") else "CPU"
        return cls._device

    @classmethod
    def load(cls, custom_path=None):
        if cls._models is not None:
            return cls._models
        import json, joblib
        from xgboost import XGBClassifier
        from app.config import MODELS_DIR
        cls._device = "GPU" if tf.config.list_physical_devices("GPU") else "CPU"
        cfg_path = MODELS_DIR / "ensemble_config.json"
        with cfg_path.open(encoding="utf-8") as f:
            cls._config = json.load(f)
        cls._models = {
            "cnn_transformer": keras.models.load_model(MODELS_DIR / "cnn_transformer.keras", custom_objects={"PositionalEmbedding": PositionalEmbedding}, compile=False),
            "eegnet": keras.models.load_model(MODELS_DIR / "eegnet.keras", compile=False),
            "xgboost": XGBClassifier(),
        }
        cls._models["xgboost"].load_model(MODELS_DIR / "xgboost.json")
        cls._scaler = joblib.load(MODELS_DIR / "psd_scaler.joblib")
        return cls._models

    @classmethod
    def get_models(cls):
        return cls._models if cls._models is not None else cls.load()

    @classmethod
    def get_model(cls):
        return cls.get_models()["cnn_transformer"]

    @classmethod
    def get_config(cls):
        if cls._config is None: cls.load()
        return cls._config

    @classmethod
    def get_scaler(cls):
        if cls._scaler is None: cls.load()
        return cls._scaler

    @classmethod
    def is_loaded(cls):
        try: cls.load(); return True
        except Exception: return False

    @classmethod
    def get_info(cls):
        models=cls.get_models()
        return {"model_loaded": True, "architecture": "CNN + Transformer + EEGNet + PSD/XGBoost (weighted ensemble)",
                "models": list(models.keys()), "device": cls._device,
                "sampling_rate": TARGET_FS, "window_seconds": WINDOW_SECONDS,
                "window_samples": WINDOW_SAMPLES, "channels": REQUIRED_CHANNELS,
                "channel_names": MODEL_CHANNEL_NAMES,
                "input_shape": list(models["cnn_transformer"].input_shape),
                "output_shape": list(models["cnn_transformer"].output_shape),
                "total_params": int(models["cnn_transformer"].count_params()+models["eegnet"].count_params())}
