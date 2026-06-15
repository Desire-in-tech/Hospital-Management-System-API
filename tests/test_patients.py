"""
CRUD tests for /patients — role-based access (patients see only themselves).
"""

import pytest

PATIENT_PAYLOAD = {
    "name": "John Doe",
    "email": "john.doe@test.com",
    "dob": "1990-05-15",
    "gender": "male",
    "address": "123 Main St",
    "phone": "555-0200",
}


class TestPatientRead:
    def test_admin_sees_all_patients(self, client, admin_headers):
        client.post("/patients/", json=PATIENT_PAYLOAD, headers=admin_headers)
        client.post("/patients/", json={**PATIENT_PAYLOAD, "email": "jane@test.com"}, headers=admin_headers)
        response = client.get("/patients/", headers=admin_headers)
        assert response.status_code == 200
        assert len(response.json()) == 2

    def test_list_patients_requires_auth(self, client):
        response = client.get("/patients/")
        assert response.status_code == 401

    def test_patient_role_sees_only_own_record(self, client, admin_headers, patient_headers):
        """A patient user can only see their own profile."""
        client.post("/patients/", json={
            "name": "Test Patient",
            "email": "patient@test.com",
        }, headers=admin_headers)
        client.post("/patients/", json={
            "name": "Other Patient",
            "email": "other@test.com",
        }, headers=admin_headers)
        response = client.get("/patients/", headers=patient_headers)
        assert response.status_code == 200
        patients = response.json()
        assert len(patients) == 1
        assert patients[0]["email"] == "patient@test.com"

    def test_get_nonexistent_patient_returns_404(self, client, admin_headers):
        response = client.get("/patients/999", headers=admin_headers)
        assert response.status_code == 404

    def test_doctor_can_list_all_patients(self, client, admin_headers, doctor_headers):
        client.post("/patients/", json=PATIENT_PAYLOAD, headers=admin_headers)
        response = client.get("/patients/", headers=doctor_headers)
        assert response.status_code == 200


class TestPatientCreate:
    def test_admin_can_create_patient(self, client, admin_headers):
        response = client.post("/patients/", json=PATIENT_PAYLOAD, headers=admin_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "john.doe@test.com"
        assert data["gender"] == "male"
        assert "id" in data

    def test_patient_cannot_self_register_via_patients_endpoint(self, client, patient_headers):
        """Creating patients is admin-only; patients register via /auth/register."""
        response = client.post("/patients/", json=PATIENT_PAYLOAD, headers=patient_headers)
        assert response.status_code == 403

    def test_doctor_cannot_create_patient(self, client, doctor_headers):
        response = client.post("/patients/", json=PATIENT_PAYLOAD, headers=doctor_headers)
        assert response.status_code == 403

    def test_duplicate_patient_email_fails(self, client, admin_headers):
        client.post("/patients/", json=PATIENT_PAYLOAD, headers=admin_headers)
        response = client.post("/patients/", json=PATIENT_PAYLOAD, headers=admin_headers)
        assert response.status_code == 400

    def test_optional_fields_can_be_omitted(self, client, admin_headers):
        response = client.post("/patients/", json={
            "name": "Minimal Patient",
            "email": "minimal@test.com",
        }, headers=admin_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["dob"] is None
        assert data["gender"] is None

    def test_invalid_gender_rejected(self, client, admin_headers):
        response = client.post("/patients/", json={
            **PATIENT_PAYLOAD,
            "email": "badgender@test.com",
            "gender": "unknown_value",
        }, headers=admin_headers)
        assert response.status_code == 422


class TestPatientUpdate:
    def test_admin_can_update_patient(self, client, admin_headers):
        create = client.post("/patients/", json=PATIENT_PAYLOAD, headers=admin_headers)
        patient_id = create.json()["id"]
        response = client.put(
            f"/patients/{patient_id}",
            json={"phone": "555-9999"},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["phone"] == "555-9999"

    def test_patient_can_update_own_record(self, client, admin_headers, patient_headers):
        """Patients can update their own profile."""
        create = client.post("/patients/", json={
            "name": "Test Patient",
            "email": "patient@test.com",
        }, headers=admin_headers)
        patient_id = create.json()["id"]
        response = client.put(
            f"/patients/{patient_id}",
            json={"phone": "555-1111"},
            headers=patient_headers,
        )
        assert response.status_code == 200
        assert response.json()["phone"] == "555-1111"

    def test_patient_cannot_update_another_patients_record(self, client, admin_headers, patient_headers):
        other = client.post("/patients/", json={
            "name": "Other Patient",
            "email": "other@test.com",
        }, headers=admin_headers)
        other_id = other.json()["id"]
        response = client.put(
            f"/patients/{other_id}",
            json={"phone": "555-HACK"},
            headers=patient_headers,
        )
        assert response.status_code == 403


class TestPatientDelete:
    def test_admin_can_delete_patient(self, client, admin_headers):
        create = client.post("/patients/", json=PATIENT_PAYLOAD, headers=admin_headers)
        patient_id = create.json()["id"]
        response = client.delete(f"/patients/{patient_id}", headers=admin_headers)
        assert response.status_code == 200

    def test_patient_cannot_delete_record(self, client, admin_headers, patient_headers):
        create = client.post("/patients/", json={
            "name": "Test Patient",
            "email": "patient@test.com",
        }, headers=admin_headers)
        patient_id = create.json()["id"]
        response = client.delete(f"/patients/{patient_id}", headers=patient_headers)
        assert response.status_code == 403
