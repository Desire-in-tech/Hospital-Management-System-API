"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  deletePrescription,
  getMedicalRecords,
  getPatients,
  getPrescriptions,
} from "@/lib/api";
import { getToken, getTokenPayload } from "@/lib/auth";
import type { MedicalRecord, Patient, Prescription } from "@/lib/types";

export default function PrescriptionsPage() {
  const router = useRouter();
  const payload = getTokenPayload();
  const role = payload?.role ?? null;

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    async function loadPrescriptions() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [prescriptionsData, recordsData] = await Promise.all([
          getPrescriptions(token),
          getMedicalRecords(token),
        ]);

        setPrescriptions(prescriptionsData);
        setRecords(recordsData);

        if (role === "admin" || role === "doctor") {
          const patientsData = await getPatients(token);
          setPatients(patientsData);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load prescriptions.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPrescriptions();
  }, [role, router]);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Delete this prescription? This action cannot be undone.",
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deletePrescription(token, id);
      setPrescriptions((current) =>
        current.filter((prescription) => prescription.id !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete prescription.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getRecord(id: number) {
    return records.find((record) => record.id === id);
  }

  function getPatientName(patientId: number) {
    return (
      patients.find((patient) => patient.id === patientId)?.name ??
      `Patient #${patientId}`
    );
  }

  if (!role) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#66736c]">Loading your workspace...</p>
      </main>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#245c4a]">
              Clinical care
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#194536]">
              Prescriptions
            </h1>
            <p className="mt-1 text-sm text-[#66736c]">
              Review medicines prescribed through medical records.
            </p>
          </div>

          {(role === "admin" || role === "doctor") && (
            <Link
              href="/dashboard/prescriptions/new"
              className="inline-flex items-center justify-center rounded-md bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#194536]"
            >
              Add prescription
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-md border border-[#e7caca] bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border border-[#dfe5df] bg-white px-5 py-10 text-center text-sm text-[#66736c]">
            Loading prescriptions...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="border border-[#dfe5df] bg-[#eef6f1] px-5 py-12 text-center">
            <h2 className="text-base font-semibold text-[#194536]">
              No prescriptions found
            </h2>
            <p className="mt-1 text-sm text-[#66736c]">
              Prescriptions will appear here when they are added to medical
              records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#dfe5df] bg-white">
            <table className="min-w-full divide-y divide-[#dfe5df]">
              <thead className="bg-[#eef6f1]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                    Medicine
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                    Dosage
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                    Duration
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                    Medical record
                  </th>
                  {role === "admin" && (
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#66736c]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#dfe5df]">
                {prescriptions.map((prescription) => {
                  const record = getRecord(prescription.medical_record_id);

                  return (
                    <tr key={prescription.id} className="hover:bg-[#f8fbf9]">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#194536]">
                        {prescription.medicine_name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-[#66736c]">
                        {prescription.dosage}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-[#66736c]">
                        {prescription.duration}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#66736c]">
                        <Link
                          href={`/dashboard/medical-records/${prescription.medical_record_id}`}
                          className="text-[#4f8fc7] hover:text-[#a94b4b]"
                        >
                          Record #{prescription.medical_record_id}
                        </Link>
                        {record && (
                          <span className="ml-2 text-xs text-[#66736c]">
                            — {getPatientName(record.patient_id)}
                          </span>
                        )}
                      </td>
                      {role === "admin" && (
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(prescription.id)}
                            disabled={deletingId === prescription.id}
                            className="text-sm font-medium text-[#a94b4b] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === prescription.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
