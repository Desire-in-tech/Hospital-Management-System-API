"""
CRUD tests for /departments — admin-only writes, authenticated reads.
"""

import pytest


DEPT_PAYLOAD = {"name": "Cardiology"}


class TestDepartmentRead:
    def test_list_departments_empty(self, client, admin_headers):
        response = client.get("/departments/", headers=admin_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_departments_requires_auth(self, client):
        response = client.get("/departments/")
        assert response.status_code == 401

    def test_get_nonexistent_department_returns_404(self, client, admin_headers):
        response = client.get("/departments/999", headers=admin_headers)
        assert response.status_code == 404

    def test_doctor_can_read_departments(self, client, doctor_headers):
        response = client.get("/departments/", headers=doctor_headers)
        assert response.status_code == 200

    def test_patient_can_read_departments(self, client, patient_headers):
        response = client.get("/departments/", headers=patient_headers)
        assert response.status_code == 200


class TestDepartmentCreate:
    def test_admin_can_create_department(self, client, admin_headers):
        response = client.post("/departments/", json=DEPT_PAYLOAD, headers=admin_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Cardiology"
        assert "id" in data

    def test_doctor_cannot_create_department(self, client, doctor_headers):
        response = client.post("/departments/", json=DEPT_PAYLOAD, headers=doctor_headers)
        assert response.status_code == 403

    def test_patient_cannot_create_department(self, client, patient_headers):
        response = client.post("/departments/", json=DEPT_PAYLOAD, headers=patient_headers)
        assert response.status_code == 403

    def test_duplicate_department_name_fails(self, client, admin_headers):
        client.post("/departments/", json=DEPT_PAYLOAD, headers=admin_headers)
        response = client.post("/departments/", json=DEPT_PAYLOAD, headers=admin_headers)
        assert response.status_code == 400

    def test_created_department_appears_in_list(self, client, admin_headers):
        client.post("/departments/", json={"name": "Neurology"}, headers=admin_headers)
        client.post("/departments/", json={"name": "Oncology"}, headers=admin_headers)
        response = client.get("/departments/", headers=admin_headers)
        names = [d["name"] for d in response.json()]
        assert "Neurology" in names
        assert "Oncology" in names


class TestDepartmentUpdate:
    def test_admin_can_update_department(self, client, admin_headers):
        create = client.post("/departments/", json={"name": "Old Name"}, headers=admin_headers)
        dept_id = create.json()["id"]
        response = client.put(f"/departments/{dept_id}", json={"name": "New Name"}, headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    def test_doctor_cannot_update_department(self, client, admin_headers, doctor_headers):
        create = client.post("/departments/", json={"name": "Surgery"}, headers=admin_headers)
        dept_id = create.json()["id"]
        response = client.put(f"/departments/{dept_id}", json={"name": "Hacked"}, headers=doctor_headers)
        assert response.status_code == 403

    def test_update_nonexistent_department_returns_404(self, client, admin_headers):
        response = client.put("/departments/999", json={"name": "Ghost"}, headers=admin_headers)
        assert response.status_code == 404


class TestDepartmentDelete:
    def test_admin_can_delete_department(self, client, admin_headers):
        create = client.post("/departments/", json={"name": "To Delete"}, headers=admin_headers)
        dept_id = create.json()["id"]
        response = client.delete(f"/departments/{dept_id}", headers=admin_headers)
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()

    def test_deleted_department_no_longer_accessible(self, client, admin_headers):
        create = client.post("/departments/", json={"name": "Gone"}, headers=admin_headers)
        dept_id = create.json()["id"]
        client.delete(f"/departments/{dept_id}", headers=admin_headers)
        response = client.get(f"/departments/{dept_id}", headers=admin_headers)
        assert response.status_code == 404

    def test_patient_cannot_delete_department(self, client, admin_headers, patient_headers):
        create = client.post("/departments/", json={"name": "Safe Dept"}, headers=admin_headers)
        dept_id = create.json()["id"]
        response = client.delete(f"/departments/{dept_id}", headers=patient_headers)
        assert response.status_code == 403
