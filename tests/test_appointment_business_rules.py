"""
Business-rule tests for appointments.

These tests describe the expected appointment behavior before
the service implementation is hardened.
"""

from datetime import datetime, timedelta

from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient


def make_appointment(
    db,
    hospital,
    patient_user,
    doctor_user,
    appointment_date,
    status=AppointmentStatus.pending,
    reason="Routine consultation",
):
    patient = (
        db.query(Patient)
        .filter(
            Patient.user_id == patient_user.id,
            Patient.hospital_id == hospital.id,
        )
        .first()
    )

    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.user_id == doctor_user.id,
            Doctor.hospital_id == hospital.id,
        )
        .first()
    )

    assert patient is not None
    assert doctor is not None

    appointment = Appointment(
        hospital_id=hospital.id,
        patient_id=patient.id,
        doctor_id=doctor.id,
        appointment_date=appointment_date,
        status=status,
        reason=reason,
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment


def test_cannot_book_appointment_in_the_past(
    client,
    patient_headers,
    doctor_user,
    db,
    hospital_a,
):
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.user_id == doctor_user.id,
            Doctor.hospital_id == hospital_a.id,
        )
        .first()
    )
    assert doctor is not None

    response = client.post(
        "/appointments/",
        headers=patient_headers,
        json={
            "doctor_id": doctor.id,
            "appointment_date": (
                datetime.now() - timedelta(days=1)
            ).isoformat(),
            "reason": "Past appointment",
        },
    )

    assert response.status_code == 400


def test_doctor_cannot_be_double_booked(
    client,
    patient_headers,
    doctor_user,
    db,
    hospital_a,
    patient_user,
):
    appointment_time = datetime.now() + timedelta(days=1)

    make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        appointment_time,
    )

    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.user_id == doctor_user.id,
            Doctor.hospital_id == hospital_a.id,
        )
        .first()
    )
    assert doctor is not None

    response = client.post(
        "/appointments/",
        headers=patient_headers,
        json={
            "doctor_id": doctor.id,
            "appointment_date": appointment_time.isoformat(),
            "reason": "Another appointment",
        },
    )

    assert response.status_code == 400


def test_patient_cannot_be_double_booked(
    client,
    patient_headers,
    doctor_user,
    second_doctor_user,
    db,
    hospital_a,
    patient_user,
):
    appointment_time = datetime.now() + timedelta(days=1)

    make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        appointment_time,
    )

    second_doctor = (
        db.query(Doctor)
        .filter(
            Doctor.user_id == second_doctor_user.id,
            Doctor.hospital_id == hospital_a.id,
        )
        .first()
    )

    assert second_doctor is not None

    response = client.post(
        "/appointments/",
        headers=patient_headers,
        json={
            "doctor_id": second_doctor.id,
            "appointment_date": appointment_time.isoformat(),
            "reason": "Different doctor, same patient",
        },
    )

    assert response.status_code == 400


def test_pending_appointment_can_be_confirmed(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
):
    appointment = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        datetime.now() + timedelta(days=1),
        AppointmentStatus.pending,
    )

    response = client.put(
        f"/appointments/{appointment.id}",
        headers=doctor_headers,
        json={"status": "confirmed"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


def test_confirmed_appointment_can_be_completed(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
):
    appointment = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        datetime.now() + timedelta(days=1),
        AppointmentStatus.confirmed,
    )

    response = client.put(
        f"/appointments/{appointment.id}",
        headers=doctor_headers,
        json={"status": "completed"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "completed"


def test_pending_appointment_can_be_cancelled(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
):
    appointment = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        datetime.now() + timedelta(days=1),
        AppointmentStatus.pending,
    )

    response = client.put(
        f"/appointments/{appointment.id}",
        headers=doctor_headers,
        json={"status": "cancelled"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


def test_completed_appointment_cannot_change_status(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
):
    appointment = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        datetime.now() - timedelta(hours=1),
        AppointmentStatus.completed,
    )

    response = client.put(
        f"/appointments/{appointment.id}",
        headers=doctor_headers,
        json={"status": "pending"},
    )

    assert response.status_code == 400


def test_cancelled_appointment_cannot_change_status(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
):
    appointment = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        datetime.now() + timedelta(days=1),
        AppointmentStatus.cancelled,
    )

    response = client.put(
        f"/appointments/{appointment.id}",
        headers=doctor_headers,
        json={"status": "confirmed"},
    )

    assert response.status_code == 400


def test_completed_appointment_cannot_be_rescheduled(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
):
    appointment = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        datetime.now() - timedelta(hours=1),
        AppointmentStatus.completed,
    )

    response = client.put(
        f"/appointments/{appointment.id}",
        headers=doctor_headers,
        json={
            "appointment_date": (
                datetime.now() + timedelta(days=2)
            ).isoformat()
        },
    )

    assert response.status_code == 400


def test_cancelled_appointment_cannot_be_rescheduled(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
):
    appointment = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        datetime.now() + timedelta(days=1),
        AppointmentStatus.cancelled,
    )

    response = client.put(
        f"/appointments/{appointment.id}",
        headers=doctor_headers,
        json={
            "appointment_date": (
                datetime.now() + timedelta(days=2)
            ).isoformat()
        },
    )

    assert response.status_code == 400


def test_rescheduling_cannot_create_doctor_conflict(
    client,
    doctor_headers,
    db,
    hospital_a,
    patient_user,
    doctor_user,
    second_doctor_user,
):
    first_time = datetime.now() + timedelta(days=1)
    conflicting_time = datetime.now() + timedelta(days=2)

    # Existing appointment for the same doctor at the target time.
    existing = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        conflicting_time,
    )

    # Create another appointment for the same doctor at a different time.
    second = make_appointment(
        db,
        hospital_a,
        patient_user,
        doctor_user,
        first_time,
    )

    response = client.put(
        f"/appointments/{second.id}",
        headers=doctor_headers,
        json={
            "appointment_date": conflicting_time.isoformat(),
        },
    )

    assert response.status_code == 400

    # Make sure the conflicting appointment still exists unchanged.
    db.refresh(second)
    assert second.appointment_date == first_time
    assert existing.appointment_date == conflicting_time
