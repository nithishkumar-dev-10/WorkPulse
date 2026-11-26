import json
import uuid
from pathlib import Path

from fastapi.testclient import TestClient

from api import app

EXAMPLES = Path(__file__).resolve().parents[1] / "examples" / "employee.json"
EMPLOYEE = json.loads(EXAMPLES.read_text(encoding="utf-8"))


def _email() -> str:
    return f"user-{uuid.uuid4().hex[:10]}@example.com"


def _headers(ip: str) -> dict:
    return {"X-Forwarded-For": ip}


def _signup(client: TestClient, email: str, password: str = "password123", ip: str = "10.1.0.1"):
    return client.post(
        "/api/auth/signup",
        json={"name": "Auth User", "email": email, "password": password},
        headers=_headers(ip),
    )


def _login(client: TestClient, email: str, password: str, ip: str = "10.2.0.1"):
    return client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
        headers=_headers(ip),
    )


def test_signup_normalizes_email_and_hides_hash():
    with TestClient(app) as client:
        email = f"Mixed.Case-{uuid.uuid4().hex[:8]}@Example.COM"
        response = _signup(client, email)
        assert response.status_code == 201, response.text
        body = response.json()
        assert body["email"] == email.lower()
        assert body["name"] == "Auth User"
        assert body["is_active"] is True
        assert set(body) == {"id", "name", "email", "is_active", "created_at", "updated_at"}
        assert "password_hash" not in body


def test_duplicate_email_is_rejected():
    with TestClient(app) as client:
        email = _email()
        assert _signup(client, email, ip="10.3.0.1").status_code == 201
        duplicate = _signup(client, email.upper(), ip="10.3.0.2")
        assert duplicate.status_code == 409
        assert "already exists" in duplicate.json()["detail"]


def test_weak_password_is_rejected():
    with TestClient(app) as client:
        assert _signup(client, _email(), password="short1", ip="10.4.0.1").status_code == 422
        assert _signup(client, _email(), password="lettersonly", ip="10.4.0.2").status_code == 422


def test_wrong_password_uses_generic_error():
    with TestClient(app) as client:
        email = _email()
        assert _signup(client, email, ip="10.5.0.1").status_code == 201
        response = _login(client, email, "wrongpassword", ip="10.5.0.2")
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid email or password"


def test_login_sets_http_only_cookies_and_me_works():
    with TestClient(app) as client:
        email = _email()
        assert _signup(client, email, ip="10.6.0.1").status_code == 201
        response = _login(client, email, "password123", ip="10.6.0.2")
        assert response.status_code == 200

        cookie_headers = response.headers.get_list("set-cookie")
        assert any("workpulse_access=" in value and "httponly" in value.lower() for value in cookie_headers)
        assert any("workpulse_refresh=" in value and "httponly" in value.lower() for value in cookie_headers)

        me = client.get("/api/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == email


def test_prediction_requires_auth_and_works_when_logged_in():
    with TestClient(app) as client:
        email = _email()
        assert _signup(client, email, ip="10.7.0.1").status_code == 201

        unauthenticated = client.post("/predict", json={"model": "xgboost", "employee": EMPLOYEE})
        assert unauthenticated.status_code == 401

        assert _login(client, email, "password123", ip="10.7.0.2").status_code == 200
        prediction = client.post("/predict", json={"model": "xgboost", "employee": EMPLOYEE})
        assert prediction.status_code == 200
        assert prediction.json()["prediction"] in {"Yes", "No"}


def test_refresh_issues_a_new_access_token():
    with TestClient(app) as client:
        email = _email()
        assert _signup(client, email, ip="10.8.0.1").status_code == 201
        assert _login(client, email, "password123", ip="10.8.0.2").status_code == 200
        old_access = client.cookies.get("workpulse_access")

        response = client.post("/api/auth/refresh")
        assert response.status_code == 200
        assert response.json()["message"] == "Access token refreshed"
        assert client.cookies.get("workpulse_access")
        assert old_access is not None
        assert client.get("/api/auth/me").status_code == 200


def test_logout_clears_session():
    with TestClient(app) as client:
        email = _email()
        assert _signup(client, email, ip="10.9.0.1").status_code == 201
        assert _login(client, email, "password123", ip="10.9.0.2").status_code == 200
        assert client.get("/api/auth/me").status_code == 200

        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        assert client.get("/api/auth/me").status_code == 401


def test_login_is_rate_limited():
    with TestClient(app) as client:
        email = _email()
        assert _signup(client, email, ip="10.11.0.1").status_code == 201
        statuses = [
            _login(client, email, "wrongpassword", ip="10.11.0.9").status_code
            for _ in range(6)
        ]
        assert statuses == [401, 401, 401, 401, 401, 429]
