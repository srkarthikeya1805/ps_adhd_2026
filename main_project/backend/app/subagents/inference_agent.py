from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from app.model.inference import run_inference
from app.utils.files import infer_folder_label
from app.utils.logging import log_pipeline_step


class InferenceSubagent:
    """
    Subagent responsible for deep learning ensemble evaluation and clinical concordance.
    
    Evaluates conditioned (N, 1280, 19) window tensors across the active hybrid ensemble:
    - CNN-Transformer (Weight 0.50)
    - EEGNet (Weight 0.25)
    - Welch PSD + XGBoost (Weight 0.25)
    """

    @classmethod
    def predict(
        cls,
        X: np.ndarray,
        display_name: str
    ) -> Tuple[float, str, List[float], List[Dict[str, Any]], Dict[str, Any]]:
        """
        Run neural network ensemble inference on window tensors.
        """
        mean_prob, pred_class, window_probs, window_records, agg_metrics = run_inference(X)

        folder_ctx = infer_folder_label(display_name)
        agg_metrics["folder_context"] = folder_ctx

        log_pipeline_step(
            "INFERENCE",
            f"Ensemble prediction for '{display_name}': {pred_class} (Prob={mean_prob:.4f}, Confidence={agg_metrics['confidence']:.4f})"
        )

        return mean_prob, pred_class, window_probs, window_records, agg_metrics
