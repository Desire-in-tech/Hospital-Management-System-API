"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAppointment,
  createAppointmentAsAdmin,
  getDoctors,
  getPatients,
} from "@/lib/api";
import { getToken, getTokenPayload } from "@/lib/auth";
import type { Doctor, Patient } from "@/lib/types";

export default function NewAppointmentPage() {
  const router = useRouter();
  const role = getTokenPayload()?.role ?? null;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = getToken();

      if (!token || !role || role === "doctor") {
        setLoading(false);
        return;
      }

      try {
        const doctorData = await getDoctors(token);
        setDoctors(doctorData);

        if (role === "admin") {
          const patientData = await getPatients(token);
          setPatients(patientData);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointment data.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();

    if (!token || !role) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (!doctorId || !appointmentDate) {
      setError("Doctor and appointment date are required.");
      return;
    }

    if (role === "admin" && !patientId) {
      setError("Patient is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (role === "admin") {
        await createAppointmentAsAdmin(token, {
          patient_id: Number(patientId),
          doctor_id: Number(doctorId),
          appointment_date: new Date(appointmentDate).toISOString(),
          reason: reason || undefined,
        });
      } else if (role === "patient") {
        await createAppointment(token, {
          doctor_id: Number(doctorId),
          appointment_date: new Date(appointmentDate).toISOString(),
          reason: reason || undefined,
        });
      } else {
        setError("Doctors cannot create appointments.");
        return;
      }

      router.push("/dashboard/appointments");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create appointment.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!role) {
    return (
      <main className="px-6 py-10 lg:px-8">
        <p className="text-sm text-[#66736c]">Loading...</p>
      </main>
    );
  }

  if (role === "doctor") {
    return (
      <main className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-[#a94b4b]">
            Doctors cannot create appointments.
          </p>
          <Link
            href="/dashboard/appointments"
            className="mt-4 inline-block text-sm font-medium text-[#4f8fc7] hover:text-[#245c4a]"
          >
            Back to appointments
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/appointments"
          className="text-sm font-medium text-[#4f8fc7] hover:text-[#245c4a]"
        >
          ← Back to appointments
        </Link>

        <div className="mt-6 border-b border-[#dfe5df] pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8fc7]">
            Appointments
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#17221d]">
            {role === "admin" ? "Create appointment" : "Book appointment"}
          </h1>
        </div>

        {error && (
          <div className="mt-6 border border-[#c94b4b] bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 border border-[#dfe5df] bg-white p-6"
        >
          {role === "admin" && (
            <label className="block">
              <span className="text-sm font-medium text-[#194536]">
                Patient
              </span>
              <select
                required
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                disabled={loading || saving}
                className="mt-2 w-full border border-[#dfe5df] bg-white px-3 py-3 text-sm outline-none focus:border-[#245c4a]"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} — {patient.email}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-[#194536]">
              Doctor
            </span>
            <select
              required
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              disabled={loading || saving}
              className="mt-2 w-full border border-[#dfe5df] bg-white px-3 py-3 text-sm outline-none focus:border-[#245c4a]"
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
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#194536]">
              Appointment date and time
            </span>
            <input
              required
              type="datetime-local"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              disabled={saving}
              className="mt-2 w-full border border-[#dfe5df] bg-white px-3 py-3 text-sm outline-none focus:border-[#245c4a]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#194536]">
              Reason
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={saving}
              rows={4}
              placeholder="Reason for the appointment"
              className="mt-2 w-full resize-y border border-[#dfe5df] bg-white px-3 py-3 text-sm outline-none focus:border-[#245c4a]"
            />
          </label>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full border border-[#245c4a] bg-[#245c4a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}
