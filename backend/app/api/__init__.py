from fastapi import APIRouter
from app.api.routes_health import router as health_router
from app.api.routes_model import router as model_router
from app.api.routes_predict import router as predict_router
from app.api.routes_validate import router as validate_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(model_router)
api_router.include_router(validate_router)
api_router.include_router(predict_router)

__all__ = ["api_router"]
