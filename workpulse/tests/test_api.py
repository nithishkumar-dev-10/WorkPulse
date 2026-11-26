import json
from pathlib import Path

from src.predict import predict

EXAMPLES = Path(__file__).resolve().parents[1] / "examples" / "employee.json"
EMPLOYEE = json.loads(EXAMPLES.read_text(encoding="utf-8"))


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert len(body["models"]) == 3


def test_models(client):
    response = client.get("/models")
    assert response.status_code == 200
    body = response.json()
    assert body["default"] == "xgboost"
    assert {item["id"] for item in body["models"]} == {
        "logistic", "random_forest", "xgboost"
    }
    assert all(isinstance(item["threshold"], float) for item in body["models"])


def test_schema(client):
    response = client.get("/schema")
    assert response.status_code == 200
    fields = response.json()
    assert len(fields) == 30
    required = {"name", "label", "type", "group", "ui", "options", "min", "max", "default"}
    assert all(required <= set(field) for field in fields)

    by_name = {field["name"]: field for field in fields}
    assert by_name["Age"]["min"] == 18
    assert by_name["Age"]["max"] == 60
    assert by_name["OverTime"]["options"] == ["Yes", "No"]
    assert by_name["OverTime"]["ui"] == "toggle"
    assert len({field["group"] for field in fields}) == 5


def test_valid_predict(client):
    response = client.post("/predict", json={"model": "xgboost", "employee": EMPLOYEE})
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"prediction", "probability", "threshold", "model"}
    assert body["prediction"] in {"Yes", "No"}
    assert 0 <= body["probability"] <= 1
    assert body["threshold"] > 0
    assert body["model"] == "xgboost"


def test_missing_field(client):
    employee = dict(EMPLOYEE)
    del employee["Age"]
    response = client.post("/predict", json={"model": "xgboost", "employee": employee})
    assert response.status_code == 422
    assert "Age" in response.text


def test_wrong_type(client):
    employee = dict(EMPLOYEE)
    employee["Age"] = "not-a-number"
    response = client.post("/predict", json={"model": "xgboost", "employee": employee})
    assert response.status_code == 422
    assert "Age" in response.text


def test_unknown_model(client):
    response = client.post("/predict", json={"model": "nope", "employee": EMPLOYEE})
    assert response.status_code == 404
    assert "Unknown model" in response.json()["detail"]


def test_batch(client):
    response = client.post(
        "/predict/batch",
        json={"model": "random_forest", "employees": [EMPLOYEE, EMPLOYEE]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 2
    assert len(body["predictions"]) == 2
    assert all(item["model"] == "random_forest" for item in body["predictions"])


def test_explain(client):
    response = client.post("/explain", json={"model": "xgboost", "employee": EMPLOYEE})
    assert response.status_code == 200
    body = response.json()
    assert len(body["top_factors"]) == 5
    assert all(
        {"feature", "label", "value", "direction"} <= set(factor)
        for factor in body["top_factors"]
    )
    assert all(
        factor["direction"] in {"increases", "decreases"}
        for factor in body["top_factors"]
    )


def test_pure_predict_is_json_serializable():
    result = predict("logistic", EMPLOYEE)
    assert set(result) == {"prediction", "probability", "threshold", "model"}
    assert json.loads(json.dumps(result)) == result
