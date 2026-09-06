"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createDepartment } from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";

export default function NewDepartmentPage() {
  const router = useRouter();
  const role = getCurrentRole();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

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
      await createDepartment(token, { name: name.trim() });
      router.push("/dashboard/departments");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create department.",
      );
    } finally {
      setSaving(false);
    }
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
            Add department
          </h1>
          <p className="mt-1 text-sm text-[#66736c]">
            Create a department for your hospital.
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

          <label className="block text-sm text-[#194536]">
            Department name

            <input
              required
              minLength={1}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Cardiology"
              className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
            />
          </label>

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#245c4a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create department"}
            </button>

            <Link
              href="/dashboard/departments"
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
