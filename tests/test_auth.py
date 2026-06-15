"""
Authentication tests — register, login, token validation, role assignment.
"""

import pytest


class TestRegister:
    def test_register_as_patient(self, client):
        response = client.post("/auth/register", json={
            "name": "Alice Patient",
            "email": "alice@test.com",
            "password": "Alice@1234",
            "role": "patient",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "alice@test.com"
        assert data["role"] == "patient"
        assert "password" not in data
        assert "password_hash" not in data

    def test_register_as_doctor(self, client):
        response = client.post("/auth/register", json={
            "name": "Dr. Bob",
            "email": "bob@test.com",
            "password": "Bob@1234",
            "role": "doctor",
        })
        assert response.status_code == 201
        assert response.json()["role"] == "doctor"

    def test_register_as_admin(self, client):
        response = client.post("/auth/register", json={
            "name": "Super Admin",
            "email": "superadmin@test.com",
            "password": "Admin@1234",
            "role": "admin",
        })
        assert response.status_code == 201
        assert response.json()["role"] == "admin"

    def test_register_default_role_is_patient(self, client):
        response = client.post("/auth/register", json={
            "name": "No Role User",
            "email": "norole@test.com",
            "password": "NoRole@1234",
        })
        assert response.status_code == 201
        assert response.json()["role"] == "patient"

    def test_register_duplicate_email_fails(self, client):
        payload = {
            "name": "Charlie",
            "email": "charlie@test.com",
            "password": "Charlie@1234",
            "role": "patient",
        }
        client.post("/auth/register", json=payload)
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_register_invalid_email_fails(self, client):
        response = client.post("/auth/register", json={
            "name": "Bad Email",
            "email": "not-an-email",
            "password": "Bad@1234",
            "role": "patient",
        })
        assert response.status_code == 422

    def test_register_missing_fields_fails(self, client):
        response = client.post("/auth/register", json={"name": "Missing Fields"})
        assert response.status_code == 422


class TestLogin:
    def test_login_success_returns_token(self, client):
        client.post("/auth/register", json={
            "name": "Login User",
            "email": "login@test.com",
            "password": "Login@1234",
            "role": "patient",
        })
        response = client.post("/auth/login", json={
            "email": "login@test.com",
            "password": "Login@1234",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 20

    def test_login_wrong_password_fails(self, client):
        client.post("/auth/register", json={
            "name": "Wrong Pass",
            "email": "wrongpass@test.com",
            "password": "Right@1234",
            "role": "patient",
        })
        response = client.post("/auth/login", json={
            "email": "wrongpass@test.com",
            "password": "Wrong@9999",
        })
        assert response.status_code == 401

    def test_login_unknown_email_fails(self, client):
        response = client.post("/auth/login", json={
            "email": "ghost@test.com",
            "password": "Ghost@1234",
        })
        assert response.status_code == 401

    def test_oauth2_token_endpoint_works(self, client):
        """Swagger UI-compatible form-based token endpoint."""
        client.post("/auth/register", json={
            "name": "Form Login",
            "email": "form@test.com",
            "password": "Form@1234",
            "role": "patient",
        })
        response = client.post("/auth/token", data={
            "username": "form@test.com",
            "password": "Form@1234",
        })
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_token_grants_access_to_protected_route(self, client):
        client.post("/auth/register", json={
            "name": "Token User",
            "email": "tokenuser@test.com",
            "password": "Token@1234",
            "role": "admin",
        })
        login = client.post("/auth/login", json={
            "email": "tokenuser@test.com",
            "password": "Token@1234",
        })
        token = login.json()["access_token"]
        response = client.get(
            "/departments/",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
