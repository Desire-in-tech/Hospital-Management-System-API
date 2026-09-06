"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAppointment, updateAppointment } from "@/lib/api";
import { getToken, getTokenPayload } from "@/lib/auth";
import type { AppointmentStatus } from "@/lib/types";

const statuses: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16);
}

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const role = getTokenPayload()?.role ?? null;

  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = getToken();
      const id = Number(params.id);

      if (!token || !role || !Number.isInteger(id) || id <= 0) {
        setLoading(false);
        return;
      }

      try {
        const appointment = await getAppointment(token, id);

        setStatus(appointment.status);
        setAppointmentDate(toLocalDateTime(appointment.appointment_date));
        setReason(appointment.reason ?? "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointment.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id, role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();
    const id = Number(params.id);

    if (!token || !role || !Number.isInteger(id) || id <= 0) {
      setError("Invalid appointment or expired session.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateAppointment(token, id, {
        status,
        appointment_date: appointmentDate
          ? new Date(appointmentDate).toISOString()
          : undefined,
        reason: reason || undefined,
      });

      router.push("/dashboard/appointments");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update appointment.",
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

  if (role === "patient") {
    return (
      <main className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-[#a94b4b]">
            Patients cannot edit appointments.
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
            Edit appointment
          </h1>
        </div>

        {error && (
          <div className="mt-6 border border-[#c94b4b] bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-sm text-[#66736c]">
            Loading appointment...
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6 border border-[#dfe5df] bg-white p-6"
          >
            <label className="block">
              <span className="text-sm font-medium text-[#194536]">
                Status
              </span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as AppointmentStatus)
                }
                disabled={saving}
                className="mt-2 w-full border border-[#dfe5df] bg-white px-3 py-3 text-sm outline-none focus:border-[#245c4a]"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
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
                className="mt-2 w-full resize-y border border-[#dfe5df] bg-white px-3 py-3 text-sm outline-none focus:border-[#245c4a]"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full border border-[#245c4a] bg-[#245c4a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
