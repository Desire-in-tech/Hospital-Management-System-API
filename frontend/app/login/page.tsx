"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { login } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const [hospitalSlug, setHospitalSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({
        hospital_slug: hospitalSlug.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      saveToken(result.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8">
        <header>
          <Link href="/" className="inline-flex items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#245c4a] text-xl font-semibold text-white">
              +
            </span>
            <span className="ml-3 text-xl font-semibold tracking-tight text-[#194536]">
              CareFlow
            </span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-16">
          <section className="w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8fc7]">
                CareFlow
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#17221d]">
                Welcome back
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#66736c]">
                Sign in to access your hospital workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="border border-[#f0cccc] bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="hospital-slug"
                  className="mb-2 block text-sm font-medium text-[#17221d]"
                >
                  Hospital slug
                </label>
                <input
                  id="hospital-slug"
                  name="hospital_slug"
                  type="text"
                  value={hospitalSlug}
                  onChange={(event) => setHospitalSlug(event.target.value)}
                  placeholder="example-hospital"
                  required
                  autoComplete="organization"
                  className="w-full border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#17221d] outline-none transition focus:border-[#245c4a] focus:ring-2 focus:ring-[#dceeff]"
                />
                <p className="mt-2 text-xs text-[#66736c]">
                  The unique slug assigned to your hospital.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#17221d]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@hospital.com"
                  required
                  autoComplete="email"
                  className="w-full border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#17221d] outline-none transition focus:border-[#245c4a] focus:ring-2 focus:ring-[#dceeff]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#17221d]"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#17221d] outline-none transition focus:border-[#245c4a] focus:ring-2 focus:ring-[#dceeff]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#245c4a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#66736c]">
              Setting up a new hospital?{" "}
              <Link
                href="/register"
                className="font-medium text-[#4f8fc7] transition hover:text-[#c94b4b]"
              >
                Create your hospital
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
