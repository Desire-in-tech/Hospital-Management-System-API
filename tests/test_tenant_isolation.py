"""
Multi-tenant security tests.

These tests verify that users from one hospital cannot access or modify
resources belonging to another hospital.
"""

from app.models.department import Department


class TestTenantIsolation:

    def test_hospital_cannot_see_another_hospitals_departments(
        self,
        client,
        db,
        hospital_a,
        hospital_b,
        admin_headers,
        hospital_b_admin_headers,
    ):
        # Create a department in Hospital A.
        department = Department(
            hospital_id=hospital_a.id,
            name="Cardiology",
        )
        db.add(department)
        db.commit()
        db.refresh(department)

        # Hospital A can see its own department.
        response_a = client.get(
            "/departments/",
            headers=admin_headers,
        )

        assert response_a.status_code == 200
        assert any(
            item["id"] == department.id
            for item in response_a.json()
        )

        # Hospital B must not see Hospital A's department.
        response_b = client.get(
            "/departments/",
            headers=hospital_b_admin_headers,
        )

        assert response_b.status_code == 200
        assert all(
            item["id"] != department.id
            for item in response_b.json()
        )


    def test_hospital_cannot_update_another_hospitals_department(
        self,
        client,
        db,
        hospital_a,
        admin_headers,
        hospital_b_admin_headers,
    ):
        department = Department(
            hospital_id=hospital_a.id,
            name="Cardiology",
        )
        db.add(department)
        db.commit()
        db.refresh(department)

        response = client.put(
            f"/departments/{department.id}",
            json={"name": "Neurology"},
            headers=hospital_b_admin_headers,
        )

        assert response.status_code in (403, 404)

        db.refresh(department)
        assert department.name == "Cardiology"


    def test_hospital_cannot_delete_another_hospitals_department(
        self,
        client,
        db,
        hospital_a,
        admin_headers,
        hospital_b_admin_headers,
    ):
        department = Department(
            hospital_id=hospital_a.id,
            name="Cardiology",
        )
        db.add(department)
        db.commit()
        db.refresh(department)

        response = client.delete(
            f"/departments/{department.id}",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code in (403, 404)

        # The department must still exist.
        remaining = (
            db.query(Department)
            .filter(Department.id == department.id)
            .first()
        )

        assert remaining is not None
        assert remaining.name == "Cardiology"
