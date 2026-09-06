"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPatient, updatePatient } from "@/lib/api";
import { getCurrentRole, getToken } from "@/lib/auth";
import type { Patient } from "@/lib/types";

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const role = getCurrentRole();
  const id = Number(params.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Patient["gender"]>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const allowed =
    role === "admin" ||
    role === "doctor" ||
    role === "patient";

  useEffect(() => {
    if (!allowed || !Number.isInteger(id)) {
      return;
    }

    async function load() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getPatient(token, id);

        setPatient(data);
        setName(data.name);
        setEmail(data.email);
        setDob(data.dob ?? "");
        setGender(data.gender);
        setAddress(data.address ?? "");
        setPhone(data.phone ?? "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load patient.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [allowed, id, router]);

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
      await updatePatient(token, id, {
        name,
        email,
        dob: dob || undefined,
        gender: gender ?? undefined,
        address: address || undefined,
        phone: phone || undefined,
      });

      router.push("/dashboard/patients");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update patient.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!allowed) return null;

  if (!Number.isInteger(id)) {
    return (
      <section className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/patients"
            className="text-sm text-[#245c4a] hover:text-[#c94b4b]"
          >
            ← Back to patients
          </Link>

          <p className="mt-6 text-sm text-[#a94b4b]">
            Invalid patient ID.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/patients"
          className="text-sm text-[#245c4a] hover:text-[#c94b4b]"
        >
          ← Back to patients
        </Link>

        <div className="mt-6 mb-8">
          <p className="mb-1 text-sm font-medium text-[#245c4a]">
            {role === "patient" ? "My care" : "Clinical"}
          </p>

          <h1 className="text-2xl font-semibold text-[#194536]">
            Edit patient
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-[#66736c]">
            Loading patient...
          </p>
        ) : !patient ? (
          <p className="text-sm text-[#a94b4b]">
            {error || "Patient not found."}
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

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm text-[#194536]">
                Full name

                <input
                  required
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Email

                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Phone

                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Date of birth

                <input
                  type="date"
                  value={dob}
                  onChange={(event) =>
                    setDob(event.target.value)
                  }
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>

              <label className="text-sm text-[#194536]">
                Gender

                <select
                  value={gender ?? ""}
                  onChange={(event) =>
                    setGender(
                      event.target.value === ""
                        ? null
                        : (event.target.value as Patient["gender"]),
                    )
                  }
                  className="mt-2 w-full border border-[#dfe5df] bg-white px-3 py-2.5 outline-none focus:border-[#245c4a]"
                >
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="text-sm text-[#194536] sm:col-span-2">
                Address

                <textarea
                  rows={3}
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  className="mt-2 w-full border border-[#dfe5df] px-3 py-2.5 outline-none focus:border-[#245c4a]"
                />
              </label>
            </div>

            {role === "patient" && (
              <p className="mt-5 text-xs text-[#66736c]">
                You can update your own patient information. Other
                patient accounts cannot be modified from your account.
              </p>
            )}

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#245c4a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <Link
                href="/dashboard/patients"
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
