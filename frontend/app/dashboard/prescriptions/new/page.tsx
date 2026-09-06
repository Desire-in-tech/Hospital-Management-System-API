"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createPrescription,
  getMedicalRecords,
} from "@/lib/api";
import { getToken, getTokenPayload } from "@/lib/auth";
import type { MedicalRecord } from "@/lib/types";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const payload = getTokenPayload();
  const role = payload?.role ?? null;

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [medicalRecordId, setMedicalRecordId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    if (role !== "admin" && role !== "doctor") {
      return;
    }

    async function loadRecords() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const recordsData = await getMedicalRecords(token);
        setRecords(recordsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load medical records.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [role, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!medicalRecordId) {
      setError("Please select a medical record.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createPrescription(token, {
        medical_record_id: Number(medicalRecordId),
        medicine_name: medicineName.trim(),
        dosage: dosage.trim(),
        duration: duration.trim(),
      });

      router.push("/dashboard/prescriptions");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create prescription.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!role) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#66736c]">Loading your workspace...</p>
      </main>
    );
  }

  if (role === "patient") {
    return (
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl border border-[#dfe5df] bg-[#eef6f1] p-6">
          <h1 className="text-xl font-semibold text-[#194536]">
            Access denied
          </h1>
          <p className="mt-2 text-sm text-[#66736c]">
            Patients can view prescriptions but cannot create them.
          </p>
          <Link
            href="/dashboard/prescriptions"
            className="mt-5 inline-block text-sm font-medium text-[#4f8fc7] hover:text-[#a94b4b]"
          >
            Back to prescriptions
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard/prescriptions"
            className="text-sm font-medium text-[#4f8fc7] hover:text-[#a94b4b]"
          >
            ← Back to prescriptions
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-[#194536]">
            Add prescription
          </h1>
          <p className="mt-1 text-sm text-[#66736c]">
            Add medication to an existing medical record.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-md border border-[#e7caca] bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border border-[#dfe5df] bg-white px-5 py-10 text-center text-sm text-[#66736c]">
            Loading medical records...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 border border-[#dfe5df] bg-white p-6"
          >
            <div>
              <label
                htmlFor="medical-record"
                className="mb-2 block text-sm font-medium text-[#194536]"
              >
                Medical record
              </label>
              <select
                id="medical-record"
                value={medicalRecordId}
                onChange={(event) => setMedicalRecordId(event.target.value)}
                required
                className="w-full border border-[#dfe5df] bg-white px-3 py-2.5 text-sm text-[#194536] outline-none focus:border-[#245c4a]"
              >
                <option value="">Select a medical record</option>
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    Record #{record.id} — {record.diagnosis}
                  </option>
                ))}
              </select>
              {role === "doctor" && (
                <p className="mt-2 text-xs text-[#66736c]">
                  You can only prescribe for medical records assigned to your
                  doctor profile.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="medicine-name"
                className="mb-2 block text-sm font-medium text-[#194536]"
              >
                Medicine name
              </label>
              <input
                id="medicine-name"
                type="text"
                value={medicineName}
                onChange={(event) => setMedicineName(event.target.value)}
                required
                placeholder="e.g. Amoxicillin"
                className="w-full border border-[#dfe5df] px-3 py-2.5 text-sm text-[#194536] outline-none placeholder:text-[#8a968f] focus:border-[#245c4a]"
              />
            </div>

            <div>
              <label
                htmlFor="dosage"
                className="mb-2 block text-sm font-medium text-[#194536]"
              >
                Dosage
              </label>
              <input
                id="dosage"
                type="text"
                value={dosage}
                onChange={(event) => setDosage(event.target.value)}
                required
                placeholder="e.g. 500mg twice daily"
                className="w-full border border-[#dfe5df] px-3 py-2.5 text-sm text-[#194536] outline-none placeholder:text-[#8a968f] focus:border-[#245c4a]"
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="mb-2 block text-sm font-medium text-[#194536]"
              >
                Duration
              </label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                required
                placeholder="e.g. 7 days"
                className="w-full border border-[#dfe5df] px-3 py-2.5 text-sm text-[#194536] outline-none placeholder:text-[#8a968f] focus:border-[#245c4a]"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/prescriptions"
                className="inline-flex items-center justify-center border border-[#dfe5df] px-4 py-2.5 text-sm font-medium text-[#66736c] hover:bg-[#eef6f1]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || records.length === 0}
                className="inline-flex items-center justify-center bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#194536] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Create prescription"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
