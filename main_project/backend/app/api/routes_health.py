from fastapi import APIRouter
from app.model.model_loader import ModelManager
from app.schemas.responses import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
@router.get("/api/health", response_model=HealthResponse)
def get_health():
    """Return backend service status, model availability, and execution device."""
    return HealthResponse(
        status="healthy",
        model_loaded=ModelManager.is_loaded(),
        device=ModelManager.detect_device(),
        version="3.0.0"
    )


