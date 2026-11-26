"""Test-only environment defaults. ``settings`` is built at import time, so this
must run before the app is imported by any test module.
"""

import os
import uuid

import pytest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-only-secret-not-for-production")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:5173")
os.environ.setdefault("AUTH_COOKIE_SECURE", "false")

TEST_EMAIL = f"test-{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient

    from api import app

    with TestClient(app) as test_client:
        signup = test_client.post(
            "/api/auth/signup",
            json={"name": "Test User", "email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"X-Forwarded-For": "10.10.0.1"},
        )
        assert signup.status_code == 201, signup.text
        login = test_client.post(
            "/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"X-Forwarded-For": "10.10.0.2"},
        )
        assert login.status_code == 200, login.text
        yield test_client
