"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAppointments, getDoctors, getPatients, deleteAppointment, updateAppointment } from "@/lib/api";
import { getToken, getTokenPayload } from "@/lib/auth";
import type { Appointment, AppointmentStatus, Doctor, Patient } from "@/lib/types";

const statusOptions: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AppointmentsPage() {
  const role = getTokenPayload()?.role ?? null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = getToken();

      if (!token || !role) {
        setLoading(false);
        return;
      }

      try {
        const appointmentData = await getAppointments(token);
        setAppointments(appointmentData);

        const doctorData = await getDoctors(token);
        setDoctors(doctorData);

        if (role === "admin" || role === "doctor") {
          const patientData = await getPatients(token);
          setPatients(patientData);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointments.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [role]);

  function doctorName(id: number) {
    return doctors.find((doctor) => doctor.id === id)?.name ?? `Doctor #${id}`;
  }

  function patientName(id: number) {
    return patients.find((patient) => patient.id === id)?.name ?? `Patient #${id}`;
  }

  async function handleStatusChange(
    appointmentId: number,
    status: AppointmentStatus,
  ) {
    const token = getToken();

    if (!token) return;

    try {
      setSavingId(appointmentId);
      setError("");

      const updated = await updateAppointment(token, appointmentId, {
        status,
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? updated : appointment,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update appointment.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(appointmentId: number) {
    if (!window.confirm("Delete this appointment?")) {
      return;
    }

    const token = getToken();

    if (!token) return;

    try {
      setSavingId(appointmentId);
      setError("");

      await deleteAppointment(token, appointmentId);

      setAppointments((current) =>
        current.filter((appointment) => appointment.id !== appointmentId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete appointment.",
      );
    } finally {
      setSavingId(null);
    }
  }

  if (!role) {
    return (
      <main className="px-6 py-10 lg:px-8">
        <p className="text-sm text-[#66736c]">Loading...</p>
      </main>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-[#dfe5df] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8fc7]">
              Appointments
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#17221d]">
              Appointment management
            </h1>
            <p className="mt-3 text-sm text-[#66736c]">
              View and manage appointments within your hospital workspace.
            </p>
          </div>

          {(role === "admin" || role === "patient") && (
            <Link
              href="/dashboard/appointments/new"
              className="inline-flex w-fit border border-[#245c4a] bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a]"
            >
              {role === "patient" ? "Book appointment" : "Add appointment"}
            </Link>
          )}
        </div>

        {error && (
          <div className="mt-6 border border-[#c94b4b] bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-x-auto border border-[#dfe5df]">
          <table className="min-w-full divide-y divide-[#dfe5df] text-left">
            <thead className="bg-[#eef6f1]">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Doctor
                </th>
                {(role === "admin" || role === "doctor") && (
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                    Patient
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Reason
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Status
                </th>
                {(role === "admin" || role === "doctor") && (
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#dfe5df] bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-[#66736c]"
                  >
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-[#66736c]"
                  >
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 text-sm text-[#17221d]">
                      {formatDate(appointment.appointment_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#17221d]">
                      {doctorName(appointment.doctor_id)}
                    </td>
                    {(role === "admin" || role === "doctor") && (
                      <td className="px-6 py-4 text-sm text-[#17221d]">
                        {patientName(appointment.patient_id)}
                      </td>
                    )}
                    <td className="max-w-xs px-6 py-4 text-sm text-[#66736c]">
                      {appointment.reason || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {role === "admin" || role === "doctor" ? (
                        <select
                          value={appointment.status}
                          disabled={savingId === appointment.id}
                          onChange={(event) =>
                            handleStatusChange(
                              appointment.id,
                              event.target.value as AppointmentStatus,
                            )
                          }
                          className="border border-[#dfe5df] bg-white px-3 py-2 text-sm text-[#17221d] outline-none focus:border-[#245c4a]"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm font-medium capitalize text-[#245c4a]">
                          {appointment.status}
                        </span>
                      )}
                    </td>

                    {(role === "admin" || role === "doctor") && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/dashboard/appointments/${appointment.id}/edit`}
                            className="text-sm font-medium text-[#4f8fc7] hover:text-[#245c4a]"
                          >
                            Edit
                          </Link>

                          {role === "admin" && (
                            <button
                              type="button"
                              disabled={savingId === appointment.id}
                              onClick={() => handleDelete(appointment.id)}
                              className="text-sm font-medium text-[#a94b4b] hover:text-[#c94b4b] disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
