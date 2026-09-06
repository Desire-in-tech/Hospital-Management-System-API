"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDoctor, getDepartments } from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Department } from "@/lib/types";

export default function NewDoctorPage() {
  const router = useRouter();
  const role = getCurrentRole();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function loadDepartments() {
      const token = getToken();
      if (!token) return;

      try {
        setDepartments(await getDepartments(token));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load departments.");
      }
    }

    loadDepartments();
  }, [role, router]);

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
      await createDoctor(token, {
        name,
        email,
        password,
        phone: phone || undefined,
        specialization: specialization || undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
      });

      router.push("/dashboard/doctors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create doctor.");
    } finally {
      setSaving(false);
    }
  }

  if (role !== "admin") return null;

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
          <h1 className="text-2xl font-semibold text-[#194536]">Add doctor</h1>
          <p className="mt-1 text-sm text-[#66736c]">
            Create a doctor account and assign their clinical details.
          </p>
        </div>

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
              Temporary password
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                placeholder="e.g. Cardiology"
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
              {saving ? "Creating..." : "Create doctor"}
            </button>

            <Link
              href="/dashboard/doctors"
              className="border border-[#dfe5df] px-5 py-2.5 text-sm text-[#66736c] hover:border-[#245c4a] hover:text-[#245c4a]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
