"""
Authentication tests for the multi-tenant authentication system.
"""

class TestRegister:

    def test_register_hospital_admin(self, client):
        response = client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Hospital Admin",
                "email": "admin@example.com",
                "password": "Admin@1234",
            },
        )

        assert response.status_code == 201

        data = response.json()

        assert data["name"] == "Hospital Admin"
        assert data["email"] == "admin@example.com"
        assert data["role"] == "admin"
        assert data["hospital_id"] is not None
        assert "password" not in data
        assert "password_hash" not in data


    def test_register_duplicate_hospital_slug_fails(self, client):
        payload = {
            "hospital_name": "City Hospital",
            "hospital_slug": "city-hospital",
            "name": "Admin One",
            "email": "admin1@example.com",
            "password": "Admin@1234",
        }

        first = client.post("/auth/register", json=payload)
        assert first.status_code == 201

        second = client.post(
            "/auth/register",
            json={
                **payload,
                "email": "admin2@example.com",
            },
        )

        assert second.status_code == 400
        assert "slug" in second.json()["detail"].lower()


    def test_register_missing_fields_fails(self, client):
        response = client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
            },
        )

        assert response.status_code == 422


    def test_register_invalid_email_fails(self, client):
        response = client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Admin",
                "email": "not-an-email",
                "password": "Admin@1234",
            },
        )

        assert response.status_code == 422


    def test_register_short_password_fails(self, client):
        response = client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Admin",
                "email": "admin@example.com",
                "password": "short",
            },
        )

        assert response.status_code == 422


class TestLogin:

    def test_login_success_returns_token(self, client):
        client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Login Admin",
                "email": "login@example.com",
                "password": "Login@1234",
            },
        )

        response = client.post(
            "/auth/login",
            json={
                "hospital_slug": "city-hospital",
                "email": "login@example.com",
                "password": "Login@1234",
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 20


    def test_login_wrong_password_fails(self, client):
        client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Wrong Password",
                "email": "wrongpass@example.com",
                "password": "Right@1234",
            },
        )

        response = client.post(
            "/auth/login",
            json={
                "hospital_slug": "city-hospital",
                "email": "wrongpass@example.com",
                "password": "Wrong@9999",
            },
        )

        assert response.status_code == 401


    def test_login_unknown_email_fails(self, client):
        response = client.post(
            "/auth/login",
            json={
                "hospital_slug": "city-hospital",
                "email": "ghost@example.com",
                "password": "Ghost@1234",
            },
        )

        assert response.status_code == 401


    def test_login_wrong_hospital_fails(self, client):
        client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Hospital Admin",
                "email": "admin@example.com",
                "password": "Admin@1234",
            },
        )

        response = client.post(
            "/auth/login",
            json={
                "hospital_slug": "wrong-hospital",
                "email": "admin@example.com",
                "password": "Admin@1234",
            },
        )

        assert response.status_code == 401


    def test_oauth2_token_endpoint_works(self, client):
        """Swagger UI-compatible form-based token endpoint."""

        client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Form Login",
                "email": "form@example.com",
                "password": "Form@1234",
            },
        )

        response = client.post(
            "/auth/token",
            data={
                "username": "city-hospital|form@example.com",
                "password": "Form@1234",
            },
        )

        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"


    def test_token_grants_access_to_protected_route(self, client):
        client.post(
            "/auth/register",
            json={
                "hospital_name": "City Hospital",
                "hospital_slug": "city-hospital",
                "name": "Protected Admin",
                "email": "protected@example.com",
                "password": "Protected@1234",
            },
        )

        login = client.post(
            "/auth/login",
            json={
                "hospital_slug": "city-hospital",
                "email": "protected@example.com",
                "password": "Protected@1234",
            },
        )

        assert login.status_code == 200

        token = login.json()["access_token"]

        response = client.get(
            "/departments/",
            headers={
                "Authorization": f"Bearer {token}",
            },
        )

        assert response.status_code == 200


    def test_invalid_token_is_rejected(self, client):
        response = client.get(
            "/departments/",
            headers={
                "Authorization": "Bearer definitely-not-a-valid-token",
            },
        )

        assert response.status_code == 401


class TestJWTSecurity:

    def test_access_token_contains_expected_issuer_and_audience(self):
        from app.core.security import (
            JWT_AUDIENCE,
            JWT_ISSUER,
            create_access_token,
            decode_token,
        )

        token = create_access_token({"sub": "1", "hospital_id": 1})
        payload = decode_token(token)

        assert payload is not None
        assert payload["iss"] == JWT_ISSUER
        assert payload["aud"] == JWT_AUDIENCE

    def test_token_with_wrong_issuer_is_rejected(self):
        from app.core.config import settings
        from app.core.security import JWT_AUDIENCE, decode_token
        import jwt

        token = jwt.encode(
            {
                "sub": "1",
                "hospital_id": 1,
                "iss": "wrong-issuer",
                "aud": JWT_AUDIENCE,
            },
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )

        assert decode_token(token) is None

    def test_token_with_wrong_audience_is_rejected(self):
        from app.core.config import settings
        from app.core.security import JWT_ISSUER, decode_token
        import jwt

        token = jwt.encode(
            {
                "sub": "1",
                "hospital_id": 1,
                "iss": JWT_ISSUER,
                "aud": "wrong-audience",
            },
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )

        assert decode_token(token) is None

    def test_security_headers_are_present(self, client):
        response = client.get("/health")

        assert response.status_code == 200
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["Referrer-Policy"] == "no-referrer"
