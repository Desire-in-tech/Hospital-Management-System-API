"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deletePatient, getPatients } from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Patient } from "@/lib/types";

export default function PatientsPage() {
  const router = useRouter();
  const role = getCurrentRole();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin" && role !== "doctor" && role !== "patient") {
      router.replace("/dashboard");
      return;
    }

    async function load() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setPatients(await getPatients(token));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load patients.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [role, router]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this patient? This action cannot be undone.")) {
      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      await deletePatient(token, id);
      setPatients((current) =>
        current.filter((patient) => patient.id !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete patient.",
      );
    }
  }

  if (
    role !== "admin" &&
    role !== "doctor" &&
    role !== "patient"
  ) {
    return null;
  }

  const canCreate = role === "admin";
  const canDelete = role === "admin";

  return (
    <section className="p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-[#245c4a]">
              {role === "patient" ? "My care" : "Clinical"}
            </p>

            <h1 className="text-2xl font-semibold text-[#194536]">
              {role === "patient" ? "My profile" : "Patients"}
            </h1>

            <p className="mt-1 text-sm text-[#66736c]">
              {role === "patient"
                ? "View and manage your patient information."
                : "Manage patient information across your hospital."}
            </p>
          </div>

          {canCreate && (
            <Link
              href="/dashboard/patients/new"
              className="inline-flex items-center justify-center rounded-lg bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a]"
            >
              Add patient
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-[#a94b4b]/20 bg-[#a94b4b]/5 px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#66736c]">
            Loading patients...
          </p>
        ) : patients.length === 0 ? (
          <div className="border border-[#dfe5df] bg-[#eef6f1] p-8 text-center">
            <h2 className="font-medium text-[#194536]">
              No patients found
            </h2>

            <p className="mt-1 text-sm text-[#66736c]">
              {role === "admin"
                ? "Add your first patient to begin managing patient records."
                : "No patient information is currently available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#dfe5df]">
            <table className="min-w-full divide-y divide-[#dfe5df]">
              <thead className="bg-[#eef6f1]">
                <tr>
                  {[
                    "Patient",
                    "Email",
                    "Phone",
                    "Date of birth",
                    "Gender",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#dfe5df] bg-white">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-[#eef6f1]/50"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-[#194536]">
                      {patient.name}
                    </td>

                    <td className="px-4 py-4 text-sm text-[#66736c]">
                      {patient.email}
                    </td>

                    <td className="px-4 py-4 text-sm text-[#66736c]">
                      {patient.phone ?? "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-[#66736c]">
                      {patient.dob ?? "—"}
                    </td>

                    <td className="px-4 py-4 text-sm capitalize text-[#66736c]">
                      {patient.gender ?? "—"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/patients/${patient.id}/edit`}
                          className="text-[#245c4a] hover:text-[#c94b4b]"
                        >
                          Edit
                        </Link>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(patient.id)
                            }
                            className="text-[#a94b4b] hover:text-[#194536]"
                          >
                            Delete
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
      </div>
    </section>
  );
}
