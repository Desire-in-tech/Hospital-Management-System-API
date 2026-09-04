"""
Tenant isolation tests for appointments, medical records, and prescriptions.
"""

from datetime import datetime

from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.doctor import Doctor
from app.models.patient import Patient


class TestAppointmentTenantIsolation:

    def test_hospital_cannot_see_another_hospitals_appointment(
        self,
        client,
        db,
        hospital_a,
        doctor_user,
        patient_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == doctor_user.id,
                Doctor.hospital_id == hospital_a.id,
            )
            .first()
        )

        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == patient_user.id,
                Patient.hospital_id == hospital_a.id,
            )
            .first()
        )

        appointment = Appointment(
            hospital_id=hospital_a.id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            appointment_date=datetime(2030, 1, 15, 10, 0),
            status=AppointmentStatus.pending,
            reason="Routine consultation",
        )

        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        response = client.get(
            "/appointments/",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code == 200
        assert all(
            item["id"] != appointment.id
            for item in response.json()
        )


    def test_hospital_cannot_access_another_hospitals_appointment_by_id(
        self,
        client,
        db,
        hospital_a,
        doctor_user,
        patient_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == doctor_user.id,
                Doctor.hospital_id == hospital_a.id,
            )
            .first()
        )

        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == patient_user.id,
                Patient.hospital_id == hospital_a.id,
            )
            .first()
        )

        appointment = Appointment(
            hospital_id=hospital_a.id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            appointment_date=datetime(2030, 1, 15, 10, 0),
            status=AppointmentStatus.pending,
            reason="Routine consultation",
        )

        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        response = client.get(
            f"/appointments/{appointment.id}",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code in (403, 404)


class TestMedicalRecordTenantIsolation:

    def test_hospital_cannot_see_another_hospitals_medical_record(
        self,
        client,
        db,
        hospital_a,
        doctor_user,
        patient_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == doctor_user.id,
                Doctor.hospital_id == hospital_a.id,
            )
            .first()
        )

        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == patient_user.id,
                Patient.hospital_id == hospital_a.id,
            )
            .first()
        )

        record = MedicalRecord(
            hospital_id=hospital_a.id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            diagnosis="Hypertension",
            notes="Routine follow-up",
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        response = client.get(
            "/records/",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code == 200
        assert all(
            item["id"] != record.id
            for item in response.json()
        )


    def test_hospital_cannot_access_another_hospitals_medical_record_by_id(
        self,
        client,
        db,
        hospital_a,
        doctor_user,
        patient_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == doctor_user.id,
                Doctor.hospital_id == hospital_a.id,
            )
            .first()
        )

        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == patient_user.id,
                Patient.hospital_id == hospital_a.id,
            )
            .first()
        )

        record = MedicalRecord(
            hospital_id=hospital_a.id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            diagnosis="Hypertension",
            notes="Routine follow-up",
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        response = client.get(
            f"/records/{record.id}",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code in (403, 404)


class TestPrescriptionTenantIsolation:

    def test_hospital_cannot_see_another_hospitals_prescription(
        self,
        client,
        db,
        hospital_a,
        doctor_user,
        patient_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == doctor_user.id,
                Doctor.hospital_id == hospital_a.id,
            )
            .first()
        )

        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == patient_user.id,
                Patient.hospital_id == hospital_a.id,
            )
            .first()
        )

        record = MedicalRecord(
            hospital_id=hospital_a.id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            diagnosis="Hypertension",
            notes="Prescription test",
        )

        db.add(record)
        db.flush()

        prescription = Prescription(
            medical_record_id=record.id,
            medicine_name="Example Medicine",
            dosage="10 mg",
            duration="7 days",
        )

        db.add(prescription)
        db.commit()
        db.refresh(prescription)

        response = client.get(
            "/prescriptions/",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code == 200
        assert all(
            item["id"] != prescription.id
            for item in response.json()
        )


    def test_hospital_cannot_access_another_hospitals_prescription_by_id(
        self,
        client,
        db,
        hospital_a,
        doctor_user,
        patient_user,
        hospital_b_admin_headers,
    ):
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == doctor_user.id,
                Doctor.hospital_id == hospital_a.id,
            )
            .first()
        )

        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == patient_user.id,
                Patient.hospital_id == hospital_a.id,
            )
            .first()
        )

        record = MedicalRecord(
            hospital_id=hospital_a.id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            diagnosis="Hypertension",
            notes="Prescription test",
        )

        db.add(record)
        db.flush()

        prescription = Prescription(
            medical_record_id=record.id,
            medicine_name="Example Medicine",
            dosage="10 mg",
            duration="7 days",
        )

        db.add(prescription)
        db.commit()
        db.refresh(prescription)

        response = client.get(
            f"/prescriptions/{prescription.id}",
            headers=hospital_b_admin_headers,
        )

        assert response.status_code in (403, 404)
