from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api import api_router
from app.config import (
    MODEL_CHANNEL_NAMES,
    REQUIRED_CHANNELS,
    SUPPORTED_EXTENSIONS,
    TARGET_FS,
    WINDOW_SAMPLES,
    WINDOW_SECONDS,
)
from app.model.model_loader import ModelManager
from app.utils.logging import log_pipeline_step, logger


# ============================================================
# LIFESPAN (MODEL LOADING ON STARTUP)
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model once on startup and perform cleanup on shutdown."""
    log_pipeline_step("STARTUP", "Initializing ADHD EEG Backend & loading CNN-Transformer model...")
    try:
        ModelManager.load()
    except Exception as exc:
        logger.error(f"Startup Warning: Model could not be pre-loaded: {exc}")
    yield
    log_pipeline_step("SHUTDOWN", "Shutting down ADHD EEG Backend.")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Universal EEG ADHD Detection Backend",
    description=(
        "Production & Research grade EEG processing pipeline for ADHD detection. "
        "Accepts multi-format EEG uploads (.mat, .csv, .tsv, .npy, .npz, .edf, .zip), "
        "validates signal structure, resamples to 128 Hz, filters 1-45 Hz & 50 Hz notch, "
        "normalizes per-channel, segments into 10s windows, and runs inference on the "
        "trained CNN-Transformer deep learning model."
    ),
    version="3.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)


# ============================================================
# CUSTOM OPENAPI (ENSURES NATIVE FILE PICKER IN SWAGGER UI)
# ============================================================

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # Convert contentMediaType -> format: binary so Swagger UI renders native file picker
    schemas = openapi_schema.get("components", {}).get("schemas", {})
    for schema_name, s in schemas.items():
        properties = s.get("properties", {})
        for prop_name, prop in properties.items():
            if prop.get("type") == "array" and "items" in prop:
                if prop["items"].get("contentMediaType") == "application/octet-stream" or prop_name == "files":
                    prop["items"]["type"] = "string"
                    prop["items"]["format"] = "binary"
                    prop["items"].pop("contentMediaType", None)
            elif prop.get("contentMediaType") == "application/octet-stream" or prop_name == "file":
                prop["type"] = "string"
                prop["format"] = "binary"
                prop.pop("contentMediaType", None)
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def read_root():
    """Return backend capabilities, model configuration, and pipeline status."""
    return {
        "status": "online",
        "service": "Universal EEG ADHD Detection Backend",
        "version": "3.0.0",
        "model": {
            "name": "CNN + Transformer",
            "loaded": ModelManager.is_loaded(),
            "device": ModelManager.detect_device(),
            "sampling_rate_hz": TARGET_FS,
            "window_seconds": WINDOW_SECONDS,
            "window_samples": WINDOW_SAMPLES,
            "channels_required": REQUIRED_CHANNELS,
            "model_input_shape": [None, WINDOW_SAMPLES, REQUIRED_CHANNELS],
            "channel_order": MODEL_CHANNEL_NAMES
        },
        "supported_formats": sorted(SUPPORTED_EXTENSIONS),
        "archive_support": [".zip"],
        "endpoints": {
            "health": "GET /api/health",
            "model_info": "GET /api/model/info",
            "validate": "POST /api/validate",
            "predict": "POST /api/predict",
            "predict_batch": "POST /api/predict/batch",
            "legacy_predict": "POST /predict-adhd"
        }
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
