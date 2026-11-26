"""FastAPI service for WorkPulse attrition predictions.

Run with:  venv/bin/uvicorn api:app --reload --port 8000
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Literal

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.auth import get_current_user, router as auth_router
from src.database import init_db
from src.predict import (
    load_artifacts,
    load_threshold,
    predict,
    top_contributing_features,
)
from src.schemas import (
    DEFAULT_MODEL,
    MODEL_LABELS,
    MODEL_NAMES,
    Employee,
    humanize_feature,
    schema_fields,
)
from src.settings import settings

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


EXPLAIN_ENABLED = _env_bool("ENABLE_EXPLAIN", True)
CORS_ORIGINS = list(
    dict.fromkeys(
        [
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]
        + [settings.frontend_origin]
    )
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Prepare the database and load every model exactly once at startup."""
    init_db()
    logger.info("Loading WorkPulse models at startup")
    for name in MODEL_NAMES:
        load_artifacts(name)
    for name in MODEL_NAMES:
        load_threshold(name)
    yield
    logger.info("WorkPulse shutdown")


app = FastAPI(title="WorkPulse API", version="1.0.0", lifespan=lifespan)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    model: str = DEFAULT_MODEL
    employee: Employee


class BatchRequest(BaseModel):
    model: str = DEFAULT_MODEL
    employees: list[Employee] = Field(min_length=1)


class PredictResponse(BaseModel):
    prediction: Literal["Yes", "No"]
    probability: float
    threshold: float
    model: str


class BatchResponse(BaseModel):
    count: int
    predictions: list[PredictResponse]


class HealthResponse(BaseModel):
    status: str
    models: list[str]
    explain_enabled: bool


class ModelInfo(BaseModel):
    id: str
    name: str
    threshold: float


class ModelsResponse(BaseModel):
    default: str
    models: list[ModelInfo]


class SchemaField(BaseModel):
    name: str
    label: str
    type: Literal["integer", "categorical"]
    group: str
    ui: str
    options: list[str] | None = None
    min: int | None = None
    max: int | None = None
    default: int | str


class ExplainFactor(BaseModel):
    feature: str
    label: str
    value: float
    direction: Literal["increases", "decreases"]


class ExplainResponse(BaseModel):
    model: str
    prediction: str
    probability: float
    top_factors: list[ExplainFactor]


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.exception("Unhandled API error", exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


def _check_model(model: str) -> None:
    if model not in MODEL_NAMES:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown model '{model}'. Available: {', '.join(MODEL_NAMES)}.",
        )


@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "ok",
        "models": list(MODEL_NAMES),
        "explain_enabled": EXPLAIN_ENABLED,
    }


@app.get("/models", response_model=ModelsResponse)
def models():
    return {
        "default": DEFAULT_MODEL,
        "models": [
            {
                "id": name,
                "name": MODEL_LABELS[name],
                "threshold": float(load_threshold(name)),
            }
            for name in MODEL_NAMES
        ],
    }


@app.get("/schema", response_model=list[SchemaField])
def schema():
    return schema_fields()


@app.post("/predict", response_model=PredictResponse)
def predict_employee(request: PredictRequest, _user=Depends(get_current_user)):
    _check_model(request.model)
    return predict(request.model, request.employee.model_dump())


@app.post("/predict/batch", response_model=BatchResponse)
def predict_batch(request: BatchRequest, _user=Depends(get_current_user)):
    _check_model(request.model)
    results = [predict(request.model, item.model_dump()) for item in request.employees]
    return {"count": len(results), "predictions": results}


@app.post("/explain", response_model=ExplainResponse)
def explain(request: PredictRequest, _user=Depends(get_current_user)):
    if not EXPLAIN_ENABLED:
        raise HTTPException(
            status_code=404,
            detail="Explanations are disabled. Restart the API with ENABLE_EXPLAIN=1.",
        )

    _check_model(request.model)
    employee = request.employee.model_dump()
    result = predict(request.model, employee)
    factors = top_contributing_features(pd.DataFrame([employee]), request.model, top_n=5)

    return {
        "model": request.model,
        "prediction": result["prediction"],
        "probability": result["probability"],
        "top_factors": [
            {
                "feature": feature,
                "label": humanize_feature(feature),
                "value": round(float(value), 4),
                "direction": "increases" if float(value) > 0 else "decreases",
            }
            for feature, value in factors
        ],
    }
