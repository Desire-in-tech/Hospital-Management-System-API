export type UserRole = "admin" | "doctor" | "patient";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  hospital_id: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  hospital_name: string;
  hospital_slug: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  hospital_slug: string;
  email: string;
  password: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  department_id: number | null;
  department: Department | null;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  gender: "male" | "female" | "other" | null;
  address: string | null;
  phone: string | null;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: AppointmentStatus;
  reason: string | null;
}

export interface Prescription {
  id: number;
  medical_record_id: number;
  medicine_name: string;
  dosage: string;
  duration: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  notes: string | null;
  created_at: string | null;
  prescriptions: Prescription[];
}

export interface ApiError {
  detail?: string;
}
