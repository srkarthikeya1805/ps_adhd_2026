import logging
import sys

# Configure standard logger
logger = logging.getLogger("adhd_eeg_backend")
if not logger.handlers:
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "[%(levelname)s] %(asctime)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False


def log_pipeline_step(step_name: str, message: str) -> None:
    """Log an EEG processing pipeline step in the standard format."""
    logger.info(f"[{step_name}] {message}")
