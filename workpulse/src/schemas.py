"""Input schema, field metadata and model metadata shared by CLI and API."""

from typing import Annotated, Literal, get_args, get_origin

import pandas as pd
from pydantic import BaseModel, Field

from src.config_loader import PROJECT_ROOT, load_config

MODEL_NAMES = ("logistic", "random_forest", "xgboost")
MODEL_LABELS = {
    "logistic": "Logistic Regression",
    "random_forest": "Random Forest",
    "xgboost": "XGBoost",
}
DEFAULT_MODEL = "xgboost"


class UnknownModelError(ValueError):
    """Raised when a model name is not one of the trained models."""


BusinessTravel = Literal["Non-Travel", "Travel_Rarely", "Travel_Frequently"]
Department = Literal["Sales", "Research & Development", "Human Resources"]
EducationField = Literal[
    "Life Sciences", "Medical", "Marketing", "Technical Degree", "Human Resources", "Other"
]
Gender = Literal["Female", "Male"]
JobRole = Literal[
    "Sales Executive", "Research Scientist", "Laboratory Technician",
    "Manufacturing Director", "Healthcare Representative", "Manager",
    "Sales Representative", "Research Director", "Human Resources",
]
MaritalStatus = Literal["Single", "Married", "Divorced"]
OverTime = Literal["Yes", "No"]


class Employee(BaseModel):
    """The 30 raw IBM HR fields the model was trained on."""

    model_config = {"extra": "ignore", "str_strip_whitespace": True}

    # Personal
    Age: Annotated[int, Field(ge=18, le=60, description="Age")]
    DistanceFromHome: Annotated[int, Field(ge=1, le=29, description="Distance from home")]
    Education: Annotated[int, Field(ge=1, le=5, description="Education level")]
    EducationField: Annotated[EducationField, Field(description="Education field")]
    Gender: Annotated[Gender, Field(description="Gender")]
    MaritalStatus: Annotated[MaritalStatus, Field(description="Marital status")]

    # Job
    BusinessTravel: Annotated[BusinessTravel, Field(description="Business travel")]
    Department: Annotated[Department, Field(description="Department")]
    JobRole: Annotated[JobRole, Field(description="Job role")]
    JobLevel: Annotated[int, Field(ge=1, le=5, description="Job level")]
    JobInvolvement: Annotated[int, Field(ge=1, le=4, description="Job involvement")]
    PerformanceRating: Annotated[int, Field(ge=1, le=4, description="Performance rating")]
    TrainingTimesLastYear: Annotated[int, Field(ge=0, le=6, description="Trainings last year")]

    # Compensation
    DailyRate: Annotated[int, Field(ge=102, le=1499, description="Daily rate")]
    HourlyRate: Annotated[int, Field(ge=30, le=100, description="Hourly rate")]
    MonthlyIncome: Annotated[int, Field(ge=1009, le=19999, description="Monthly income")]
    MonthlyRate: Annotated[int, Field(ge=2094, le=26999, description="Monthly rate")]
    PercentSalaryHike: Annotated[int, Field(ge=11, le=25, description="Salary hike (%)")]
    StockOptionLevel: Annotated[int, Field(ge=0, le=3, description="Stock option level")]

    # Satisfaction
    EnvironmentSatisfaction: Annotated[int, Field(ge=1, le=4, description="Environment satisfaction")]
    JobSatisfaction: Annotated[int, Field(ge=1, le=4, description="Job satisfaction")]
    RelationshipSatisfaction: Annotated[int, Field(ge=1, le=4, description="Relationship satisfaction")]
    WorkLifeBalance: Annotated[int, Field(ge=1, le=4, description="Work-life balance")]
    OverTime: Annotated[OverTime, Field(description="Overtime")]

    # Tenure
    NumCompaniesWorked: Annotated[int, Field(ge=0, le=9, description="Companies worked at")]
    TotalWorkingYears: Annotated[int, Field(ge=0, le=40, description="Total working years")]
    YearsAtCompany: Annotated[int, Field(ge=0, le=40, description="Years at company")]
    YearsInCurrentRole: Annotated[int, Field(ge=0, le=18, description="Years in current role")]
    YearsSinceLastPromotion: Annotated[int, Field(ge=0, le=15, description="Years since last promotion")]
    YearsWithCurrManager: Annotated[int, Field(ge=0, le=17, description="Years with current manager")]


# Group and widget hints are kept here so /schema can drive the entire UI.
FIELD_GROUPS: dict[str, str] = {
    "Age": "Personal", "DistanceFromHome": "Personal", "Education": "Personal",
    "EducationField": "Personal", "Gender": "Personal", "MaritalStatus": "Personal",
    "BusinessTravel": "Job", "Department": "Job", "JobRole": "Job", "JobLevel": "Job",
    "JobInvolvement": "Job", "PerformanceRating": "Job", "TrainingTimesLastYear": "Job",
    "DailyRate": "Compensation", "HourlyRate": "Compensation", "MonthlyIncome": "Compensation",
    "MonthlyRate": "Compensation", "PercentSalaryHike": "Compensation",
    "StockOptionLevel": "Compensation",
    "EnvironmentSatisfaction": "Satisfaction", "JobSatisfaction": "Satisfaction",
    "RelationshipSatisfaction": "Satisfaction", "WorkLifeBalance": "Satisfaction",
    "OverTime": "Satisfaction",
    "NumCompaniesWorked": "Tenure", "TotalWorkingYears": "Tenure",
    "YearsAtCompany": "Tenure", "YearsInCurrentRole": "Tenure",
    "YearsSinceLastPromotion": "Tenure", "YearsWithCurrManager": "Tenure",
}

FIELD_LABELS: dict[str, str] = {
    name: field.description or name.replace("_", " ")
    for name, field in Employee.model_fields.items()
}

ENGINEERED_LABELS = {
    "IncomePerYear": "Income per year",
    "SatisfactionScore": "Satisfaction score",
    "LoyaltyIndex": "Loyalty index",
    "WorkloadScore": "Workload score",
    "CareerGrowthRate": "Career growth rate",
    "OverTimeRisk": "Overtime risk",
    "TenureStabilityIndex": "Tenure stability index",
    "OverTimeXSatisfaction": "Overtime × satisfaction",
    "StagnationRisk": "Stagnation risk",
    "IncomeVsExperience": "Income vs experience",
    "DistanceXOverTime": "Distance × overtime",
}

CATEGORICAL_FIELDS = [
    name for name, field in Employee.model_fields.items()
    if get_origin(field.annotation) is Literal
]


def _constraints(field) -> tuple[int | None, int | None]:
    low = high = None
    for meta in field.metadata:
        if hasattr(meta, "ge"):
            low = meta.ge
        if hasattr(meta, "le"):
            high = meta.le
    return low, high


def example_values() -> dict[str, int | str]:
    """Typical values from the raw dataset, used as schema defaults/examples."""
    cfg = load_config()
    path = PROJECT_ROOT / cfg["paths"]["raw"][cfg["mode"]]
    raw = pd.read_csv(path)

    values: dict[str, int | str] = {}
    for name, field in Employee.model_fields.items():
        if get_origin(field.annotation) is Literal:
            values[name] = str(raw[name].mode()[0])
        else:
            values[name] = int(raw[name].median())
    return values


def schema_fields() -> list[dict]:
    """Metadata used by the frontend to build the form without hardcoded fields."""
    defaults = example_values()
    fields = []

    for name, field in Employee.model_fields.items():
        is_categorical = get_origin(field.annotation) is Literal
        low, high = _constraints(field)
        options = list(get_args(field.annotation)) if is_categorical else None

        fields.append({
            "name": name,
            "label": FIELD_LABELS[name],
            "type": "categorical" if is_categorical else "integer",
            "group": FIELD_GROUPS[name],
            "ui": "toggle" if options == ["No", "Yes"] or options == ["Yes", "No"] else (
                "select" if is_categorical else "slider"
            ),
            "options": options,
            "min": None if is_categorical else low,
            "max": None if is_categorical else high,
            "default": defaults[name],
        })

    return fields


def humanize_feature(feature: str) -> str:
    """Turn a transformed column name into a readable SHAP factor label."""
    name = feature.split("__", 1)[1] if "__" in feature else feature

    if name in FIELD_LABELS:
        return FIELD_LABELS[name]
    if name in ENGINEERED_LABELS:
        return ENGINEERED_LABELS[name]

    for field_name in CATEGORICAL_FIELDS:
        prefix = f"{field_name}_"
        if name.startswith(prefix):
            value = name[len(prefix):].replace("_", " ")
            return f"{FIELD_LABELS[field_name]}: {value}"

    return name.replace("_", " ").strip()
