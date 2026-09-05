"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokenPayload, removeToken } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Hospital Administrator",
  doctor: "Doctor",
  patient: "Patient",
};

export default function DashboardPage() {
  const router = useRouter();

  const payload = getTokenPayload();
  const role = payload?.role ?? null;

  useEffect(() => {
    if (!payload) {
      router.replace("/login");
    }
  }, [payload, router]);

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  if (!payload || !role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-[#66736c]">Loading your workspace...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-[#dfe5df]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#245c4a] text-lg font-semibold text-white">
              +
            </span>
            <span className="ml-3 text-lg font-semibold text-[#194536]">
              CareFlow
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-[#4f8fc7] transition hover:text-[#c94b4b]"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="border-b border-[#dfe5df] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8fc7]">
            Your workspace
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#17221d]">
            {roleLabels[role]}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66736c]">
            Your CareFlow workspace is ready. We&apos;ll build the full{" "}
            {role === "admin"
              ? "hospital administration"
              : role === "doctor"
                ? "clinical"
                : "patient"}{" "}
            experience next.
          </p>
        </div>

        <section className="mt-8 border border-[#dfe5df] bg-[#eef6f1] p-6">
          <p className="text-sm font-semibold text-[#194536]">
            Authentication successful
          </p>

          <p className="mt-2 text-sm text-[#66736c]">
            Your JWT was validated on the client and your role was identified
            as <strong className="text-[#245c4a]">{role}</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
