from fastapi import APIRouter
from app.model.model_loader import ModelManager
from app.schemas.responses import ModelInfoResponse

router = APIRouter(prefix="/api/model", tags=["Model"])


@router.get("/info", response_model=ModelInfoResponse)
def get_model_info():
    """Return trained CNN-Transformer model metadata, input/output shapes, and channels."""
    info = ModelManager.get_info()
    return ModelInfoResponse(**info)
