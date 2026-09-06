"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  createMedicalRecord,
  createMedicalRecordAsAdmin,
  getDoctors,
  getPatients,
} from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Doctor, Patient } from "@/lib/types";

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const role = getCurrentRole();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const authToken = getToken();

    if (!authToken) {
      router.replace("/login");
      return;
    }

    async function loadData() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        setLoading(true);
        setError("");

        const patientsData = await getPatients(token);
        setPatients(patientsData);

        if (role === "admin") {
          const doctorsData = await getDoctors(token);
          setDoctors(doctorsData);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the medical record form.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (role === "admin" || role === "doctor") {
      loadData();
    }
  }, [router, role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!patientId || !diagnosis.trim()) {
      setError("Patient and diagnosis are required.");
      return;
    }

    if (role === "admin" && !doctorId) {
      setError("Please select the doctor responsible for this record.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (role === "admin") {
        await createMedicalRecordAsAdmin(token, {
          patient_id: Number(patientId),
          doctor_id: Number(doctorId),
          diagnosis: diagnosis.trim(),
          notes: notes.trim() || undefined,
        });
      } else {
        await createMedicalRecord(token, {
          patient_id: Number(patientId),
          diagnosis: diagnosis.trim(),
          notes: notes.trim() || undefined,
        });
      }

      router.push("/dashboard/medical-records");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the medical record.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!role) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#66736c]">Loading...</p>
      </main>
    );
  }

  if (role !== "admin" && role !== "doctor") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="border border-[#dfe5df] bg-[#eef6f1] p-8 text-center">
          <h1 className="text-xl font-semibold text-[#194536]">
            Access denied
          </h1>
          <p className="mt-2 text-sm text-[#66736c]">
            Only doctors and administrators can create medical records.
          </p>
          <Link
            href="/dashboard/medical-records"
            className="mt-5 inline-block text-sm font-medium text-[#4f8fc7] hover:text-[#c94b4b]"
          >
            Back to medical records
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link
          href="/dashboard/medical-records"
          className="text-sm text-[#4f8fc7] hover:text-[#c94b4b]"
        >
          ← Medical records
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-[#194536]">
          Add Medical Record
        </h1>

        <p className="mt-1 text-sm text-[#66736c]">
          Record a diagnosis and clinical notes for a patient.
        </p>
      </div>

      {error && (
        <div className="mb-6 border border-[#a94b4b]/30 bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="border border-[#dfe5df] bg-[#eef6f1] p-8 text-center text-sm text-[#66736c]">
          Loading form...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-[#dfe5df] bg-white p-6"
        >
          <div>
            <label
              htmlFor="patient"
              className="mb-2 block text-sm font-medium text-[#194536]"
            >
              Patient
            </label>

            <select
              id="patient"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              required
              className="w-full border border-[#dfe5df] px-3 py-2.5 text-sm outline-none focus:border-[#245c4a]"
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} — {patient.email}
                </option>
              ))}
            </select>
          </div>

          {role === "admin" && (
            <div>
              <label
                htmlFor="doctor"
                className="mb-2 block text-sm font-medium text-[#194536]"
              >
                Doctor
              </label>

              <select
                id="doctor"
                value={doctorId}
                onChange={(event) => setDoctorId(event.target.value)}
                required
                className="w-full border border-[#dfe5df] px-3 py-2.5 text-sm outline-none focus:border-[#245c4a]"
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                    {doctor.specialization
                      ? ` — ${doctor.specialization}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === "doctor" && (
            <div className="border border-[#dfe5df] bg-[#eef6f1] px-4 py-3 text-sm text-[#66736c]">
              This record will automatically be assigned to your doctor
              profile.
            </div>
          )}

          <div>
            <label
              htmlFor="diagnosis"
              className="mb-2 block text-sm font-medium text-[#194536]"
            >
              Diagnosis
            </label>

            <input
              id="diagnosis"
              type="text"
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              required
              placeholder="e.g. Hypertension"
              className="w-full border border-[#dfe5df] px-3 py-2.5 text-sm outline-none focus:border-[#245c4a]"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-[#194536]"
            >
              Clinical notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Add relevant clinical observations or instructions..."
              className="w-full resize-y border border-[#dfe5df] px-3 py-2.5 text-sm outline-none focus:border-[#245c4a]"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/medical-records"
              className="inline-flex items-center justify-center border border-[#dfe5df] px-4 py-2.5 text-sm font-medium text-[#194536] hover:bg-[#eef6f1]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#dceeff] hover:text-[#194536] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create record"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
