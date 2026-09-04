"""
Tenant isolation tests for doctors and patients.
"""

from app.models.doctor import Doctor
from app.models.patient import Patient


class TestDoctorTenantIsolation:

    def test_hospital_cannot_see_another_hospitals_doctor(
        self,
        client,
        db,
        hospital_a,
        hospital_b,
        doctor_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.hospital_id == hospital_a.id,
                Doctor.user_id == doctor_user.id,
            )
            .first()
        )

        assert doctor is not None

        response = client.get(
            "/doctors/",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code == 200
        assert all(
            item["id"] != doctor.id
            for item in response.json()
        )


    def test_hospital_cannot_access_another_hospitals_doctor_by_id(
        self,
        client,
        db,
        hospital_a,
        doctor_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.hospital_id == hospital_a.id,
                Doctor.user_id == doctor_user.id,
            )
            .first()
        )

        assert doctor is not None

        response = client.get(
            f"/doctors/{doctor.id}",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code in (403, 404)


class TestPatientTenantIsolation:

    def test_hospital_cannot_see_another_hospitals_patient(
        self,
        client,
        db,
        hospital_a,
        hospital_b,
        patient_user,
        hospital_b_admin_headers,
    ):
        patient = (
            db.query(Patient)
            .filter(
                Patient.hospital_id == hospital_a.id,
                Patient.user_id == patient_user.id,
            )
            .first()
        )

        assert patient is not None

        response = client.get(
            "/patients/",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code == 200
        assert all(
            item["id"] != patient.id
            for item in response.json()
        )


    def test_hospital_cannot_access_another_hospitals_patient_by_id(
        self,
        client,
        db,
        hospital_a,
        patient_user,
        hospital_b_admin_headers,
    ):
        patient = (
            db.query(Patient)
            .filter(
                Patient.hospital_id == hospital_a.id,
                Patient.user_id == patient_user.id,
            )
            .first()
        )

        assert patient is not None

        response = client.get(
            f"/patients/{patient.id}",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code in (403, 404)
