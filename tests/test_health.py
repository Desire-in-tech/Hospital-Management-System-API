"""
Basic endpoint tests — root and health checks, unauthenticated access guards.
"""


def test_root_returns_ok(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Hospital Management System" in data["message"]


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_docs_endpoint_accessible(client):
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema_accessible(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "Hospital Management System API"


def test_protected_endpoint_requires_auth(client):
    """Accessing a protected route without a token returns 401."""
    response = client.get("/departments/")
    assert response.status_code == 401


def test_protected_endpoint_rejects_invalid_token(client):
    """A tampered/invalid JWT is rejected with 401."""
    response = client.get(
        "/departments/",
        headers={"Authorization": "Bearer this.is.not.a.valid.token"},
    )
    assert response.status_code == 401


def test_protected_endpoint_rejects_malformed_header(client):
    """A missing 'Bearer' prefix in the auth header is rejected."""
    response = client.get(
        "/departments/",
        headers={"Authorization": "just-a-token"},
    )
    assert response.status_code == 401
