"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  getDoctors,
  getMedicalRecord,
  getPatients,
} from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Doctor, MedicalRecord, Patient } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MedicalRecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const role = getCurrentRole();

  const rawId = params.id;
  const recordId = Array.isArray(rawId) ? rawId[0] : rawId;
  const validId = /^\d+$/.test(recordId ?? "");

  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    if (!validId) {
      return;
    }

    async function loadRecord() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const recordData = await getMedicalRecord(token, Number(recordId));
        setRecord(recordData);

        const [patientsData, doctorsData] = await Promise.all([
          getPatients(token),
          role === "admin" || role === "doctor"
            ? getDoctors(token)
            : Promise.resolve([]),
        ]);

        setPatient(
          patientsData.find(
            (item) => item.id === recordData.patient_id,
          ) ?? null,
        );

        setDoctor(
          doctorsData.find(
            (item) => item.id === recordData.doctor_id,
          ) ?? null,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this medical record.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecord();
  }, [recordId, router, role, validId]);

  if (!role) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#66736c]">Loading...</p>
      </main>
    );
  }

  if (!validId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="border border-[#a94b4b]/30 bg-[#fff5f5] p-8 text-center">
          <h1 className="text-xl font-semibold text-[#194536]">
            Invalid medical record
          </h1>
          <Link
            href="/dashboard/medical-records"
            className="mt-4 inline-block text-sm text-[#4f8fc7] hover:text-[#c94b4b]"
          >
            Back to medical records
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/dashboard/medical-records"
        className="text-sm text-[#4f8fc7] hover:text-[#c94b4b]"
      >
        ← Medical records
      </Link>

      {loading ? (
        <div className="mt-6 border border-[#dfe5df] bg-[#eef6f1] p-8 text-center text-sm text-[#66736c]">
          Loading medical record...
        </div>
      ) : error ? (
        <div className="mt-6 border border-[#a94b4b]/30 bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
          {error}
        </div>
      ) : record ? (
        <>
          <div className="mt-6 mb-8">
            <p className="text-sm font-medium text-[#4f8fc7]">
              Medical record #{record.id}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#194536]">
              {record.diagnosis}
            </h1>
            <p className="mt-1 text-sm text-[#66736c]">
              Created {formatDate(record.created_at)}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="border border-[#dfe5df] bg-[#eef6f1] p-6">
              <h2 className="font-semibold text-[#194536]">Patient</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-[#66736c]">Name</dt>
                  <dd className="font-medium text-[#194536]">
                    {patient?.name ?? `Patient #${record.patient_id}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#66736c]">Email</dt>
                  <dd className="text-[#194536]">
                    {patient?.email ?? "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="border border-[#dfe5df] bg-[#eef6f1] p-6">
              <h2 className="font-semibold text-[#194536]">Doctor</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-[#66736c]">Name</dt>
                  <dd className="font-medium text-[#194536]">
                    {doctor?.name ?? `Doctor #${record.doctor_id}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#66736c]">Specialization</dt>
                  <dd className="text-[#194536]">
                    {doctor?.specialization ?? "—"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="mt-6 border border-[#dfe5df] bg-white p-6">
            <h2 className="font-semibold text-[#194536]">Clinical notes</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#66736c]">
              {record.notes || "No clinical notes were added."}
            </p>
          </section>

          <section className="mt-6 border border-[#dfe5df] bg-white p-6">
            <h2 className="font-semibold text-[#194536]">
              Prescriptions ({record.prescriptions?.length ?? 0})
            </h2>

            {record.prescriptions?.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-[#dfe5df]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[#66736c]">
                      <th className="px-3 py-2">Medicine</th>
                      <th className="px-3 py-2">Dosage</th>
                      <th className="px-3 py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dfe5df]">
                    {record.prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td className="px-3 py-3 text-sm text-[#194536]">
                          {prescription.medicine_name}
                        </td>
                        <td className="px-3 py-3 text-sm text-[#66736c]">
                          {prescription.dosage}
                        </td>
                        <td className="px-3 py-3 text-sm text-[#66736c]">
                          {prescription.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#66736c]">
                No prescriptions attached to this record.
              </p>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
