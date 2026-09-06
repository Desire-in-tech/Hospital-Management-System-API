"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getCurrentRole } from "@/lib/auth";
import {
  deleteDoctor,
  getDepartments,
  getDoctors,
} from "@/lib/api";
import type { Department, Doctor } from "@/lib/types";

export default function DoctorsPage() {
  const router = useRouter();
  const role = getCurrentRole();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function load() {
      const token = getToken();
      if (!token) return;

      try {
        const [doctorData, departmentData] = await Promise.all([
          getDoctors(token),
          getDepartments(token),
        ]);

        setDoctors(doctorData);
        setDepartments(departmentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [role, router]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this doctor? This action cannot be undone.")) return;

    const token = getToken();
    if (!token) return;

    try {
      await deleteDoctor(token, id);
      setDoctors((current) => current.filter((doctor) => doctor.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete doctor.");
    }
  }

  if (role !== "admin") return null;

  const departmentName = (id: number | null) =>
    departments.find((department) => department.id === id)?.name ?? "Unassigned";

  return (
    <section className="p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-[#245c4a]">Administration</p>
            <h1 className="text-2xl font-semibold text-[#194536]">Doctors</h1>
            <p className="mt-1 text-sm text-[#66736c]">
              Manage doctors and their hospital departments.
            </p>
          </div>

          <Link
            href="/dashboard/doctors/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a]"
          >
            Add doctor
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-[#a94b4b]/20 bg-[#a94b4b]/5 px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#66736c]">Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <div className="border border-[#dfe5df] bg-[#eef6f1] p-8 text-center">
            <h2 className="font-medium text-[#194536]">No doctors yet</h2>
            <p className="mt-1 text-sm text-[#66736c]">
              Add your first doctor to start managing the clinical team.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#dfe5df]">
            <table className="min-w-full divide-y divide-[#dfe5df]">
              <thead className="bg-[#eef6f1]">
                <tr>
                  {["Doctor", "Email", "Phone", "Specialization", "Department", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#66736c]"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#dfe5df] bg-white">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-[#eef6f1]/50">
                    <td className="px-4 py-4 text-sm font-medium text-[#194536]">
                      {doctor.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#66736c]">{doctor.email}</td>
                    <td className="px-4 py-4 text-sm text-[#66736c]">
                      {doctor.phone ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#66736c]">
                      {doctor.specialization ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#66736c]">
                      {doctor.department?.name ?? departmentName(doctor.department_id)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/doctors/${doctor.id}/edit`}
                          className="text-[#245c4a] hover:text-[#c94b4b]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(doctor.id)}
                          className="text-[#a94b4b] hover:text-[#194536]"
                        >
                          Delete
                        </button>
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
