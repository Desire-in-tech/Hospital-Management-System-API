"""
CRUD tests for /doctors — admin-only writes, authenticated reads.
"""

import pytest

DOCTOR_PAYLOAD = {
    "name": "Dr. Jane Smith",
    "email": "dr.jane@test.com",
    "phone": "555-0100",
    "specialization": "Cardiologist",
    "department_id": None,
}


class TestDoctorRead:
    def test_list_doctors_empty(self, client, admin_headers):
        response = client.get("/doctors/", headers=admin_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_doctors_requires_auth(self, client):
        response = client.get("/doctors/")
        assert response.status_code == 401

    def test_get_nonexistent_doctor_returns_404(self, client, admin_headers):
        response = client.get("/doctors/999", headers=admin_headers)
        assert response.status_code == 404

    def test_patient_can_read_doctors(self, client, patient_headers):
        response = client.get("/doctors/", headers=patient_headers)
        assert response.status_code == 200


class TestDoctorCreate:
    def test_admin_can_create_doctor(self, client, admin_headers):
        response = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Dr. Jane Smith"
        assert data["email"] == "dr.jane@test.com"
        assert data["specialization"] == "Cardiologist"
        assert "id" in data

    def test_doctor_cannot_create_another_doctor(self, client, doctor_headers):
        response = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=doctor_headers)
        assert response.status_code == 403

    def test_patient_cannot_create_doctor(self, client, patient_headers):
        response = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=patient_headers)
        assert response.status_code == 403

    def test_duplicate_email_fails(self, client, admin_headers):
        client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        response = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        assert response.status_code == 400

    def test_doctor_with_department(self, client, admin_headers):
        dept = client.post("/departments/", json={"name": "Cardiology"}, headers=admin_headers)
        dept_id = dept.json()["id"]
        payload = {**DOCTOR_PAYLOAD, "email": "dept.doctor@test.com", "department_id": dept_id}
        response = client.post("/doctors/", json=payload, headers=admin_headers)
        assert response.status_code == 201
        assert response.json()["department_id"] == dept_id

    def test_created_doctor_retrievable_by_id(self, client, admin_headers):
        create = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        doctor_id = create.json()["id"]
        response = client.get(f"/doctors/{doctor_id}", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["id"] == doctor_id


class TestDoctorUpdate:
    def test_admin_can_update_doctor(self, client, admin_headers):
        create = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        doctor_id = create.json()["id"]
        response = client.put(
            f"/doctors/{doctor_id}",
            json={"specialization": "Neurologist"},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["specialization"] == "Neurologist"

    def test_doctor_cannot_update_record(self, client, admin_headers, doctor_headers):
        create = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        doctor_id = create.json()["id"]
        response = client.put(
            f"/doctors/{doctor_id}",
            json={"specialization": "Hacked"},
            headers=doctor_headers,
        )
        assert response.status_code == 403


class TestDoctorDelete:
    def test_admin_can_delete_doctor(self, client, admin_headers):
        create = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        doctor_id = create.json()["id"]
        response = client.delete(f"/doctors/{doctor_id}", headers=admin_headers)
        assert response.status_code == 200

    def test_deleted_doctor_not_found(self, client, admin_headers):
        create = client.post("/doctors/", json=DOCTOR_PAYLOAD, headers=admin_headers)
        doctor_id = create.json()["id"]
        client.delete(f"/doctors/{doctor_id}", headers=admin_headers)
        response = client.get(f"/doctors/{doctor_id}", headers=admin_headers)
        assert response.status_code == 404
