import type {
  Appointment,
  AppointmentStatus,
  Department,
  Doctor,
  LoginData,
  MedicalRecord,
  Patient,
  Prescription,
  RegisterData,
  TokenResponse,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail || `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function login(data: LoginData): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterData): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function authenticatedRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

// Doctors

export async function getDoctors(token: string): Promise<Doctor[]> {
  return authenticatedRequest<Doctor[]>("/doctors/", token);
}

export async function getDoctor(
  token: string,
  doctorId: number,
): Promise<Doctor> {
  return authenticatedRequest<Doctor>(`/doctors/${doctorId}`, token);
}

export async function createDoctor(
  token: string,
  data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    specialization?: string;
    department_id?: number;
  },
): Promise<Doctor> {
  return authenticatedRequest<Doctor>("/doctors/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDoctor(
  token: string,
  doctorId: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    department_id?: number;
  },
): Promise<Doctor> {
  return authenticatedRequest<Doctor>(`/doctors/${doctorId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDoctor(
  token: string,
  doctorId: number,
): Promise<unknown> {
  return authenticatedRequest<unknown>(`/doctors/${doctorId}`, token, {
    method: "DELETE",
  });
}

// Patients

export async function getPatients(token: string): Promise<Patient[]> {
  return authenticatedRequest<Patient[]>("/patients/", token);
}

export async function getPatient(
  token: string,
  patientId: number,
): Promise<Patient> {
  return authenticatedRequest<Patient>(`/patients/${patientId}`, token);
}

export async function createPatient(
  token: string,
  data: {
    name: string;
    email: string;
    password: string;
    dob?: string;
    gender?: "male" | "female" | "other";
    address?: string;
    phone?: string;
  },
): Promise<Patient> {
  return authenticatedRequest<Patient>("/patients/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePatient(
  token: string,
  patientId: number,
  data: {
    name?: string;
    email?: string;
    dob?: string;
    gender?: "male" | "female" | "other";
    address?: string;
    phone?: string;
  },
): Promise<Patient> {
  return authenticatedRequest<Patient>(`/patients/${patientId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePatient(
  token: string,
  patientId: number,
): Promise<unknown> {
  return authenticatedRequest<unknown>(`/patients/${patientId}`, token, {
    method: "DELETE",
  });
}

// Departments

export async function getDepartments(
  token: string,
): Promise<Department[]> {
  return authenticatedRequest<Department[]>("/departments/", token);
}

export async function getDepartment(
  token: string,
  departmentId: number,
): Promise<Department> {
  return authenticatedRequest<Department>(
    `/departments/${departmentId}`,
    token,
  );
}

export async function createDepartment(
  token: string,
  data: { name: string },
): Promise<Department> {
  return authenticatedRequest<Department>("/departments/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDepartment(
  token: string,
  departmentId: number,
  data: { name?: string },
): Promise<Department> {
  return authenticatedRequest<Department>(
    `/departments/${departmentId}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteDepartment(
  token: string,
  departmentId: number,
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `/departments/${departmentId}`,
    token,
    {
      method: "DELETE",
    },
  );
}

// Appointments

export async function getAppointments(
  token: string,
): Promise<Appointment[]> {
  return authenticatedRequest<Appointment[]>("/appointments/", token);
}

export async function getAppointment(
  token: string,
  appointmentId: number,
): Promise<Appointment> {
  return authenticatedRequest<Appointment>(
    `/appointments/${appointmentId}`,
    token,
  );
}

export async function createAppointment(
  token: string,
  data: {
    doctor_id: number;
    appointment_date: string;
    reason?: string;
  },
): Promise<Appointment> {
  return authenticatedRequest<Appointment>("/appointments/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createAppointmentAsAdmin(
  token: string,
  data: {
    patient_id: number;
    doctor_id: number;
    appointment_date: string;
    reason?: string;
  },
): Promise<Appointment> {
  const { patient_id, ...appointmentData } = data;

  return authenticatedRequest<Appointment>(
    `/appointments/admin?patient_id=${encodeURIComponent(patient_id)}`,
    token,
    {
      method: "POST",
      body: JSON.stringify(appointmentData),
    },
  );
}

export async function updateAppointment(
  token: string,
  appointmentId: number,
  data: {
    status?: AppointmentStatus;
    appointment_date?: string;
    reason?: string;
  },
): Promise<Appointment> {
  return authenticatedRequest<Appointment>(
    `/appointments/${appointmentId}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteAppointment(
  token: string,
  appointmentId: number,
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `/appointments/${appointmentId}`,
    token,
    {
      method: "DELETE",
    },
  );
}

// Medical records

export async function getMedicalRecords(
  token: string,
): Promise<MedicalRecord[]> {
  return authenticatedRequest<MedicalRecord[]>("/records/", token);
}

export async function getMedicalRecord(
  token: string,
  recordId: number,
): Promise<MedicalRecord> {
  return authenticatedRequest<MedicalRecord>(
    `/records/${recordId}`,
    token,
  );
}

export async function createMedicalRecord(
  token: string,
  data: {
    patient_id: number;
    diagnosis: string;
    notes?: string;
  },
): Promise<MedicalRecord> {
  return authenticatedRequest<MedicalRecord>("/records/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createMedicalRecordAsAdmin(
  token: string,
  data: {
    patient_id: number;
    doctor_id: number;
    diagnosis: string;
    notes?: string;
  },
): Promise<MedicalRecord> {
  const { doctor_id, ...recordData } = data;

  return authenticatedRequest<MedicalRecord>(
    `/records/admin?doctor_id=${encodeURIComponent(doctor_id)}`,
    token,
    {
      method: "POST",
      body: JSON.stringify(recordData),
    },
  );
}

export async function deleteMedicalRecord(
  token: string,
  recordId: number,
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `/records/${recordId}`,
    token,
    {
      method: "DELETE",
    },
  );
}

// Prescriptions

export async function getPrescriptions(
  token: string,
  recordId?: number,
): Promise<Prescription[]> {
  const query = recordId !== undefined
    ? `?record_id=${encodeURIComponent(recordId)}`
    : "";

  return authenticatedRequest<Prescription[]>(
    `/prescriptions/${query}`,
    token,
  );
}

export async function getPrescription(
  token: string,
  prescriptionId: number,
): Promise<Prescription> {
  return authenticatedRequest<Prescription>(
    `/prescriptions/${prescriptionId}`,
    token,
  );
}

export async function createPrescription(
  token: string,
  data: {
    medical_record_id: number;
    medicine_name: string;
    dosage: string;
    duration: string;
  },
): Promise<Prescription> {
  return authenticatedRequest<Prescription>("/prescriptions/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePrescription(
  token: string,
  prescriptionId: number,
): Promise<unknown> {
  return authenticatedRequest<unknown>(
    `/prescriptions/${prescriptionId}`,
    token,
    {
      method: "DELETE",
    },
  );
}
