"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  deleteMedicalRecord,
  getDoctors,
  getMedicalRecords,
  getPatients,
} from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Doctor, MedicalRecord, Patient } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const role = getCurrentRole();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

        const recordsData = await getMedicalRecords(token);
        setRecords(recordsData);

        const [patientsData, doctorsData] = await Promise.all([
          getPatients(token),
          role === "admin" || role === "doctor"
            ? getDoctors(token)
            : Promise.resolve([]),
        ]);

        setPatients(patientsData);
        setDoctors(doctorsData);
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

    loadData();
  }, [router, role]);

  async function handleDelete(id: number) {
    const token = getToken();

    if (!token || role !== "admin") return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this medical record?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await deleteMedicalRecord(token, id);
      setRecords((current) => current.filter((record) => record.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the medical record.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function patientName(id: number) {
    return patients.find((patient) => patient.id === id)?.name ?? `Patient #${id}`;
  }

  function doctorName(id: number) {
    return doctors.find((doctor) => doctor.id === id)?.name ?? `Doctor #${id}`;
  }

  if (!role) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#66736c]">Loading medical records...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#4f8fc7]">
            Clinical care
          </p>
          <h1 className="text-2xl font-semibold text-[#194536]">
            Medical Records
          </h1>
          <p className="mt-1 text-sm text-[#66736c]">
            Review diagnoses and clinical notes for your hospital.
          </p>
        </div>

        {(role === "admin" || role === "doctor") && (
          <Link
            href="/dashboard/medical-records/new"
            className="inline-flex items-center justify-center bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#194536]"
          >
            Add medical record
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 border border-[#a94b4b]/30 bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="border border-[#dfe5df] bg-[#eef6f1] p-8 text-center text-sm text-[#66736c]">
          Loading medical records...
        </div>
      ) : records.length === 0 ? (
        <div className="border border-[#dfe5df] bg-[#eef6f1] p-8 text-center">
          <h2 className="font-medium text-[#194536]">
            No medical records found
          </h2>
          <p className="mt-1 text-sm text-[#66736c]">
            Medical records will appear here once they are created.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#dfe5df]">
          <table className="min-w-full divide-y divide-[#dfe5df]">
            <thead className="bg-[#eef6f1]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Diagnosis
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Prescriptions
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#dfe5df] bg-white">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-[#eef6f1]/60">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[#194536]">
                    {patientName(record.patient_id)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#66736c]">
                    {doctorName(record.doctor_id)}
                  </td>

                  <td className="max-w-xs px-4 py-4 text-sm text-[#194536]">
                    {record.diagnosis}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#66736c]">
                    {formatDate(record.created_at)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#66736c]">
                    {record.prescriptions?.length ?? 0}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/medical-records/${record.id}`}
                        className="text-[#4f8fc7] hover:text-[#c94b4b]"
                      >
                        View
                      </Link>

                      {role === "admin" && (
                        <button
                          type="button"
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="text-[#a94b4b] hover:underline disabled:opacity-50"
                        >
                          {deletingId === record.id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
