"""
Seed script: generates realistic test data using Faker.
Run: python -m scripts.seed
"""

import random
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta

from faker import Faker

from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatus
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient, Gender
from app.models.prescription import Prescription
from app.models.user import User, UserRole

fake = Faker()

MEDICINES = [
    "Amoxicillin", "Ibuprofen", "Paracetamol", "Metformin", "Atorvastatin",
    "Omeprazole", "Lisinopril", "Amlodipine", "Metoprolol", "Losartan",
    "Azithromycin", "Ciprofloxacin", "Doxycycline", "Prednisone", "Warfarin",
    "Aspirin", "Cetirizine", "Loratadine", "Pantoprazole", "Gabapentin",
]

DOSAGES = ["500mg", "250mg", "100mg", "50mg", "10mg", "5mg", "1g", "200mg", "400mg", "20mg"]
DURATIONS = ["5 days", "7 days", "10 days", "14 days", "30 days", "3 months", "6 months", "ongoing"]

DEPARTMENTS = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology",
    "Dermatology", "Psychiatry", "Radiology", "Emergency Medicine", "General Surgery",
]

SPECIALIZATIONS = [
    "Cardiologist", "Neurologist", "Orthopedic Surgeon", "Pediatrician", "Oncologist",
    "Dermatologist", "Psychiatrist", "Radiologist", "Emergency Physician", "General Surgeon",
    "Internist", "Family Medicine", "Endocrinologist", "Gastroenterologist", "Urologist",
]

DIAGNOSES = [
    "Hypertension", "Type 2 Diabetes", "Upper Respiratory Infection", "Pneumonia",
    "Fracture", "Migraine", "Anxiety Disorder", "Depression", "Asthma",
    "Coronary Artery Disease", "Appendicitis", "Urinary Tract Infection",
    "Eczema", "Hypothyroidism", "Anemia", "Osteoporosis", "Back Pain",
    "Gastritis", "Cellulitis", "Bronchitis",
]


def seed():
    db = SessionLocal()
    try:
        print("Seeding database...")

        # Admin user
        admin = db.query(User).filter(User.email == "admin@hospital.com").first()
        if not admin:
            admin = User(
                name="System Admin",
                email="admin@hospital.com",
                password_hash=hash_password("Admin@1234"),
                role=UserRole.admin,
            )
            db.add(admin)
            db.commit()
            print("  Created admin user: admin@hospital.com / Admin@1234")

        # Departments
        print("  Seeding 10 departments...")
        departments = []
        for name in DEPARTMENTS:
            dept = db.query(Department).filter(Department.name == name).first()
            if not dept:
                dept = Department(name=name)
                db.add(dept)
            departments.append(dept)
        db.commit()
        for d in departments:
            db.refresh(d)

        # Doctors
        print("  Seeding 30 doctors...")
        doctors = []
        doctor_users = []
        for i in range(30):
            email = fake.unique.email()
            doctor = db.query(Doctor).filter(Doctor.email == email).first()
            if not doctor:
                doctor = Doctor(
                    name=fake.name(),
                    email=email,
                    phone=fake.phone_number()[:20],
                    specialization=random.choice(SPECIALIZATIONS),
                    department_id=random.choice(departments).id,
                )
                db.add(doctor)
                user = User(
                    name=doctor.name,
                    email=email,
                    password_hash=hash_password("Doctor@1234"),
                    role=UserRole.doctor,
                )
                db.add(user)
                doctor_users.append(user)
            doctors.append(doctor)
        db.commit()
        for d in doctors:
            db.refresh(d)

        # Patients
        print("  Seeding 500 patients...")
        patients = []
        for i in range(500):
            email = fake.unique.email()
            patient = db.query(Patient).filter(Patient.email == email).first()
            if not patient:
                dob = fake.date_of_birth(minimum_age=5, maximum_age=85)
                patient = Patient(
                    name=fake.name(),
                    email=email,
                    dob=dob,
                    gender=random.choice(list(Gender)),
                    address=fake.address()[:500],
                    phone=fake.phone_number()[:20],
                )
                db.add(patient)
                user = User(
                    name=patient.name,
                    email=email,
                    password_hash=hash_password("Patient@1234"),
                    role=UserRole.patient,
                )
                db.add(user)
            patients.append(patient)
            if i % 100 == 0:
                db.commit()
        db.commit()
        for p in patients:
            db.refresh(p)

        # Appointments
        print("  Seeding 1000 appointments...")
        appointments = []
        statuses = list(AppointmentStatus)
        for i in range(1000):
            patient = random.choice(patients)
            doctor = random.choice(doctors)
            appt_date = fake.date_time_between(start_date="-1y", end_date="+3m")
            appt = Appointment(
                patient_id=patient.id,
                doctor_id=doctor.id,
                appointment_date=appt_date,
                status=random.choice(statuses),
                reason=fake.sentence(nb_words=8),
            )
            db.add(appt)
            appointments.append(appt)
            if i % 200 == 0:
                db.commit()
        db.commit()
        for a in appointments:
            db.refresh(a)

        # Medical Records
        print("  Seeding 500 medical records...")
        records = []
        for i in range(500):
            patient = random.choice(patients)
            doctor = random.choice(doctors)
            record = MedicalRecord(
                patient_id=patient.id,
                doctor_id=doctor.id,
                diagnosis=random.choice(DIAGNOSES),
                notes=fake.paragraph(nb_sentences=3),
            )
            db.add(record)
            records.append(record)
            if i % 100 == 0:
                db.commit()
        db.commit()
        for r in records:
            db.refresh(r)

        # Prescriptions
        print("  Seeding 1000 prescriptions...")
        for i in range(1000):
            record = random.choice(records)
            prescription = Prescription(
                medical_record_id=record.id,
                medicine_name=random.choice(MEDICINES),
                dosage=random.choice(DOSAGES),
                duration=random.choice(DURATIONS),
            )
            db.add(prescription)
            if i % 200 == 0:
                db.commit()
        db.commit()

        print("\nSeed complete!")
        print("Admin credentials: admin@hospital.com / Admin@1234")
        print("Doctor credentials: (any seeded doctor email) / Doctor@1234")
        print("Patient credentials: (any seeded patient email) / Patient@1234")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
