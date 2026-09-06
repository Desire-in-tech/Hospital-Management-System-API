"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDoctor, getDepartments, updateDoctor } from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Department, Doctor } from "@/lib/types";

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const role = getCurrentRole();
  const id = Number(params.id);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    if (!Number.isInteger(id)) {
      return;
    }

    async function load() {
      const token = getToken();
      if (!token) return;

      try {
        const [doctorData, departmentData] = await Promise.all([
          getDoctor(token, id),
          getDepartments(token),
        ]);

        setDoctor(doctorData);
        setDepartments(departmentData);
        setName(doctorData.name);
        setEmail(doctorData.email);
        setPhone(doctorData.phone ?? "");
        setSpecialization(doctorData.specialization ?? "");
        setDepartmentId(doctorData.department_id?.toString() ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctor.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, role, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateDoctor(token, id, {
        name,
        email,
        phone: phone || undefined,
        specialization: specialization || undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
      });

      router.push("/dashboard/doctors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update doctor.");
    } finally {
      setSaving(false);
    }
  }

  if (role !== "admin") return null;

  if (!Number.isInteger(id)) {
    return (
      <section className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/doctors"
            className="text-sm text-[#245c4a] hover:text-[#c94b4b]"
          >
            ← Back to doctors
          </Link>
          <p className="mt-6 text-sm text-[#a94b4b]">Invalid doctor ID.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/doctors"
          className="text-sm text-[#245c4a] hover:text-[#c94b4b]"
        >
          ← Back to doctors
        </Link>

        <div className="mt-6 mb-8">
          <p className="mb-1 text-sm font-medium text-[#245c4a]">Administration</p>
          <h1 className="text-2xl font-semibold text-[#194536]">
            Edit doctor
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-[#66736c]">Loading doctor...</p>
        ) : !doctor ? (
          <p className="text-sm text-[#a94b4b]">{error || "Doctor not found."}</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="border border-[#dfe5df] bg-white p-6"
          >
            {error && (
              <div className="mb-6 rounded-lg border border-[#a94b4b]/20 bg-[#a94b4b]/5 px-4 py-3 text-sm text-[#a94b4b]">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm text-[#194536]">
                Full name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Phone
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Specialization
                <input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Department
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="mt-2 w-full border border-[#dfe5df] bg-white px-3 py-2.5 outline-none focus:border-[#245c4a]"
                >
                  <option value="">Unassigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#245c4a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <Link
                href="/dashboard/doctors"
                className="border border-[#dfe5df] px-5 py-2.5 text-sm text-[#66736c] hover:border-[#245c4a] hover:text-[#245c4a]"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
