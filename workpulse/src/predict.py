import json
import logging
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from src.config_loader import PROJECT_ROOT, load_config, load_features
from src.feature_engineering import engineer_features
from src.schemas import MODEL_NAMES, Employee, UnknownModelError

logger = logging.getLogger(__name__)

# CLI/API uses "logistic"; training saves the explainer under the full model key.
EXPLAINER_FILE_KEYS = {"logistic": "logistic_regression"}

#loading the model 
@lru_cache(maxsize=None)
def load_artifacts(model_name: str = "random_forest"):
    
    cfg = load_config()

    preprocessor = joblib.load(PROJECT_ROOT / cfg["paths"]["artifacts"]["preprocessor"])
    feature_columns = joblib.load(PROJECT_ROOT / cfg["paths"]["artifacts"]["feature_columns"])

    model_path = PROJECT_ROOT / cfg["paths"]["models"][model_name]
    model = joblib.load(model_path)

    logger.info(f"Loaded model: {model_name} from {model_path}")

    return model, preprocessor, feature_columns

#loading the shap which we have defined in the tarin.py
@lru_cache(maxsize=None)
def load_shap_explainer(model_name: str = "random_forest"):
    
    cfg = load_config()
    model_path = PROJECT_ROOT / cfg["paths"]["models"][model_name]
    explainer_key = EXPLAINER_FILE_KEYS.get(model_name, model_name)
    explainer_path = model_path.parent / f"{explainer_key}_shap_explainer.pkl"

    if not explainer_path.exists():
        logger.warning(
            f"No SHAP explainer found at {explainer_path}. Re-run training to generate one."
        )
        return None

    return joblib.load(explainer_path)


def load_threshold(model_name: str) -> float:
    """Load the tuned decision threshold saved next to the artifacts by training."""
    cfg = load_config()
    path = PROJECT_ROOT / cfg["paths"]["artifacts"]["thresholds"]

    if not path.exists():
        logger.warning(f"No thresholds file at {path}; falling back to 0.5.")
        return 0.5

    with open(path, "r", encoding="utf-8") as f:
        thresholds = json.load(f)

    if model_name not in thresholds:
        logger.warning(f"No saved threshold for '{model_name}'; falling back to 0.5.")

    return float(thresholds.get(model_name, 0.5))

#building the shap pipeline , taking the input ,allowing for prediction ,compute shap values ,return the contribution of every features
def explain_prediction(df: pd.DataFrame, model_name: str = "random_forest") -> pd.DataFrame:
   
    _, preprocessor, feature_columns = load_artifacts(model_name)
    explainer = load_shap_explainer(model_name)

    if explainer is None:
        raise FileNotFoundError(
            f"SHAP explainer for '{model_name}' not found. Re-run training first."
        )

    feat = load_features()
    target = feat["target"]

    df_clean = clean_raw_input(df)
    if target in df_clean.columns:
        df_clean = df_clean.drop(columns=[target])

    df_input = engineer_features(df_clean)

    missing_cols = set(feature_columns) - set(df_input.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns in input: {missing_cols}")
    df_input = df_input[feature_columns]

    X = preprocessor.transform(df_input)
    feature_names = preprocessor.get_feature_names_out()
    X_df = pd.DataFrame(X, columns=feature_names)

    shap_values = explainer.shap_values(X_df)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
        shap_values = shap_values[:, :, 1]

    return pd.DataFrame(shap_values, columns=feature_names, index=df.index)

#selecting the top feature which contribute more for prediction and aplllying shap values 
def top_contributing_features(df: pd.DataFrame, model_name: str = "random_forest", top_n: int = 5) -> list:
   
    shap_df = explain_prediction(df, model_name)
    row = shap_df.iloc[0]
    ranked = row.reindex(row.abs().sort_values(ascending=False).index)
    return list(ranked.head(top_n).items())


def clean_raw_input(df: pd.DataFrame) -> pd.DataFrame:
    
    df = df.copy()

    drop_cols = ['EmployeeNumber', 'EmployeeCount', 'Over18', 'StandardHours']
    df = df.drop(columns=[c for c in drop_cols if c in df.columns])

    if 'Attrition' in df.columns:
        df['Attrition'] = df['Attrition'].map({'Yes': 1, 'No': 0})

    # Cast to string — must match training (OrdinalEncoder was fit on strings)
    for col in ['JobLevel', 'StockOptionLevel']:
        if col in df.columns:
            df[col] = df[col].astype(str)

    col_maps = {
        'Education': {1: 'Below College', 2: 'College', 3: 'Bachelor', 4: 'Master', 5: 'Doctor'},
        'EnvironmentSatisfaction': {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High'},
        'JobInvolvement': {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High'},
        'JobSatisfaction': {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High'},
        'PerformanceRating': {1: 'Low', 2: 'Good', 3: 'Excellent', 4: 'Outstanding'},
        'RelationshipSatisfaction': {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High'},
        'WorkLifeBalance': {1: 'Bad', 2: 'Good', 3: 'Better', 4: 'Best'},
    }
    for col, mapping in col_maps.items():
        if col in df.columns:
            df[col] = df[col].map(mapping)

    return df


def predict_from_dataframe(df: pd.DataFrame, model_name: str = "random_forest") -> pd.DataFrame:
    """
    Run predictions on a raw input dataframe (same raw format as the original CSV).
    Returns the dataframe with two new columns: Prediction and Probability.
    """
    model, preprocessor, feature_columns = load_artifacts(model_name)
    feat = load_features()
    target = feat["target"]

    # Step 1 — clean raw input exactly like preprocessing.load_data()
    df_clean = clean_raw_input(df)

    if target in df_clean.columns:
        df_clean = df_clean.drop(columns=[target])

    # Step 2 — feature engineering, same as training
    df_input = engineer_features(df_clean)

    # Step 3 — align columns to match training feature order
    missing_cols = set(feature_columns) - set(df_input.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns in input: {missing_cols}")
    df_input = df_input[feature_columns]

    # Step 4 — transform using the fitted preprocessor
    X = preprocessor.transform(df_input)

    threshold = load_threshold(model_name)
    probabilities = model.predict_proba(X)[:, 1]
    predictions = (probabilities >= threshold).astype(int)

    result = df.copy()
    result["Prediction"] = np.where(predictions == 1, "Yes", "No")
    result["Probability"] = np.round(probabilities, 4)

    return result


def predict(model_name: str, employee: dict) -> dict:
    """Validate one raw employee record and return a JSON-serializable prediction."""
    if model_name not in MODEL_NAMES:
        raise UnknownModelError(
            f"Unknown model '{model_name}'. Available models: {', '.join(MODEL_NAMES)}."
        )

    validated = Employee.model_validate(employee)
    df = pd.DataFrame([validated.model_dump()])
    result = predict_from_dataframe(df, model_name)

    return {
        "prediction": str(result["Prediction"].iloc[0]),
        "probability": float(result["Probability"].iloc[0]),
        "threshold": float(load_threshold(model_name)),
        "model": model_name,
    }


def _row_to_dict(row: pd.Series) -> dict:
    """Convert a CSV/DataFrame row into plain Python values for validation."""
    record = {}
    for key, value in row.items():
        if pd.isna(value):
            record[key] = None
        elif hasattr(value, "item"):
            record[key] = value.item()
        else:
            record[key] = value
    return record


ASK_NUMERICAL_FIELDS = ["Age", "MonthlyIncome", "YearsAtCompany"]

ASK_CATEGORICAL_OPTIONS = {
    "Department": ["Sales", "Research & Development", "Human Resources"],
    "JobRole": ["Sales Executive", "Research Scientist", "Laboratory Technician",
                "Manufacturing Director", "Healthcare Representative", "Manager",
                "Sales Representative", "Research Director", "Human Resources"],
    "MaritalStatus": ["Single", "Married", "Divorced"],
    "OverTime": ["Yes", "No"],
}

# All raw columns the pipeline needs end-to-end (numerical_features +
# categorical_features + ordinal_maps keys from features.yaml).
ALL_NUMERICAL_FIELDS = [
    "Age", "DailyRate", "DistanceFromHome", "HourlyRate", "MonthlyIncome",
    "MonthlyRate", "NumCompaniesWorked", "PercentSalaryHike", "TotalWorkingYears",
    "TrainingTimesLastYear", "YearsAtCompany", "YearsInCurrentRole",
    "YearsSinceLastPromotion", "YearsWithCurrManager",
]
ALL_CATEGORICAL_FIELDS = [
    "BusinessTravel", "Department", "EducationField", "Gender", "JobRole",
    "MaritalStatus", "OverTime",
]

ALL_ORDINAL_FIELDS = [
    "Education", "EnvironmentSatisfaction", "JobInvolvement", "JobLevel",
    "JobSatisfaction", "PerformanceRating", "RelationshipSatisfaction",
    "StockOptionLevel", "WorkLifeBalance",
]


def _load_raw_training_df() -> pd.DataFrame:
    cfg = load_config()
    mode = cfg["mode"]
    raw_path = PROJECT_ROOT / cfg["paths"]["raw"][mode]
    return pd.read_csv(raw_path)


def compute_defaults() -> dict:
    """Compute median (numeric/ordinal) and mode (categorical) defaults
    from the raw training CSV for every field not asked of the user."""
    raw = _load_raw_training_df()
    defaults = {}

    for field in ALL_NUMERICAL_FIELDS:
        if field not in ASK_NUMERICAL_FIELDS:
            defaults[field] = int(raw[field].median())

    for field in ALL_CATEGORICAL_FIELDS:
        if field not in ASK_CATEGORICAL_OPTIONS:
            defaults[field] = raw[field].mode()[0]

    for field in ALL_ORDINAL_FIELDS:
        defaults[field] = int(raw[field].median())

    return defaults


def _prompt_float(field: str) -> int:
    while True:
        raw = input(f"{field}: ").strip()
        try:
            return int(raw)
        except ValueError:
            print("  Please enter a whole number.")


def _prompt_choice(field: str, options: list) -> str:
    print(f"{field}:")
    for i, opt in enumerate(options, 1):
        print(f"  {i}. {opt}")
    while True:
        raw = input(f"Select {field} [1-{len(options)}]: ").strip()
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            return options[int(raw) - 1]
        print("  Invalid choice, try again.")


def collect_user_input() -> pd.DataFrame:
    """Prompt the user for only the easy-to-know fields; auto-fill the rest
    using training-data medians/modes."""
    print("\n--- Enter employee details for attrition prediction ---")
    print(f"(Just {len(ASK_NUMERICAL_FIELDS) + len(ASK_CATEGORICAL_OPTIONS)} quick questions — "
          "everything else is auto-filled from typical values)\n")

    record = {}

    for field in ASK_NUMERICAL_FIELDS:
        record[field] = _prompt_float(field)

    for field, options in ASK_CATEGORICAL_OPTIONS.items():
        record[field] = _prompt_choice(field, options)

    defaults = compute_defaults()
    record.update(defaults)

    print()
    return pd.DataFrame([record])


def predict_interactive(model_name: str = "random_forest") -> tuple[pd.DataFrame, dict]:
    """Collect a single employee's details via CLI prompts and predict."""
    df = collect_user_input()
    result = predict(model_name, _row_to_dict(df.iloc[0]))
    return df, result


def predict_from_csv(csv_path: str, model_name: str = "random_forest", output_path: str = None) -> pd.DataFrame:
    """Run predictions on a CSV file and optionally save the results."""
    df = pd.read_csv(csv_path)
    results = [predict(model_name, _row_to_dict(row)) for _, row in df.iterrows()]

    result = df.copy()
    result["Prediction"] = [item["prediction"] for item in results]
    result["Probability"] = [item["probability"] for item in results]

    if output_path:
        result.to_csv(output_path, index=False)
        logger.info(f"Predictions saved to {output_path}")

    return result


def run_prediction(input_path: str = None, model_name: str = "random_forest", output_path: str = None) -> None:
    """Entry point used by main.py --stage predict.

    If input_path is None or "interactive", prompts the user on the CLI
    for a single employee's details. Otherwise treats input_path as a CSV
    file and runs batch prediction.
    """
    if input_path is None or input_path.lower() == "interactive":
        df, result = predict_interactive(model_name)
        if output_path:
            saved = df.copy()
            saved["Prediction"] = result["prediction"]
            saved["Probability"] = result["probability"]
            saved.to_csv(output_path, index=False)
            logger.info(f"Predictions saved to {output_path}")
        logger.info("Predicted 1 row using %s.", model_name)
        printable = [{"Prediction": result["prediction"], "Probability": result["probability"]}]
        print(pd.DataFrame(printable).to_string(index=False))

        try:
            top_features = top_contributing_features(df, model_name)
            print("\nTop factors behind this prediction (SHAP):")
            for name, value in top_features:
                direction = "increases" if value > 0 else "decreases"
                print(f"  {name}: {value:+.4f} ({direction} attrition risk)")
        except FileNotFoundError as e:
            logger.warning(str(e))

        return

    if output_path is None:
        output_path = str(PROJECT_ROOT / "reports" / "predictions.csv")

    result = predict_from_csv(input_path, model_name, output_path)
    logger.info(f"Predicted {len(result)} rows using {model_name}.")
    print(result[["Prediction", "Probability"]].head(10).to_string(index=False))