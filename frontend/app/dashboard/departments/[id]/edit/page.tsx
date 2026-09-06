"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDepartment,
  updateDepartment,
} from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Department } from "@/lib/types";

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const role = getCurrentRole();
  const id = Number(params.id);

  const [department, setDepartment] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin" || !Number.isInteger(id)) {
      return;
    }

    async function load() {
      const token = getToken();

      if (!token) return;

      try {
        const data = await getDepartment(token, id);
        setDepartment(data);
        setName(data.name);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load department.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, role]);

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
      await updateDepartment(token, id, {
        name: name.trim(),
      });

      router.push("/dashboard/departments");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update department.",
      );
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
            href="/dashboard/departments"
            className="text-sm text-[#245c4a] hover:text-[#c94b4b]"
          >
            ← Back to departments
          </Link>

          <p className="mt-6 text-sm text-[#a94b4b]">
            Invalid department ID.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/departments"
          className="text-sm text-[#245c4a] hover:text-[#c94b4b]"
        >
          ← Back to departments
        </Link>

        <div className="mt-6 mb-8">
          <p className="mb-1 text-sm font-medium text-[#245c4a]">
            Administration
          </p>
          <h1 className="text-2xl font-semibold text-[#194536]">
            Edit department
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-[#66736c]">
            Loading department...
          </p>
        ) : !department ? (
          <p className="text-sm text-[#a94b4b]">
            {error || "Department not found."}
          </p>
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

            <label className="block text-sm text-[#194536]">
              Department name

              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
              />
            </label>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#245c4a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <Link
                href="/dashboard/departments"
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
