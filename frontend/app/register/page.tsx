"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalSlug, setHospitalSlug] = useState("");
  const [name, setName] = useState("");
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
      await register({
        hospital_name: hospitalName.trim(),
        hospital_slug: hospitalSlug.trim().toLowerCase(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the hospital. Please try again.",
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

        <div className="flex flex-1 items-center justify-center py-12">
          <section className="w-full max-w-lg">
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8fc7]">
                Get started
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#17221d]">
                Create your hospital
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#66736c]">
                Set up your hospital workspace and administrator account.
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
                  htmlFor="hospital-name"
                  className="mb-2 block text-sm font-medium text-[#17221d]"
                >
                  Hospital name
                </label>
                <input
                  id="hospital-name"
                  type="text"
                  value={hospitalName}
                  onChange={(event) => setHospitalName(event.target.value)}
                  placeholder="Example Hospital"
                  required
                  minLength={2}
                  className="w-full border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#17221d] outline-none transition focus:border-[#245c4a] focus:ring-2 focus:ring-[#dceeff]"
                />
              </div>

              <div>
                <label
                  htmlFor="hospital-slug"
                  className="mb-2 block text-sm font-medium text-[#17221d]"
                >
                  Hospital slug
                </label>
                <input
                  id="hospital-slug"
                  type="text"
                  value={hospitalSlug}
                  onChange={(event) =>
                    setHospitalSlug(
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    )
                  }
                  placeholder="example-hospital"
                  required
                  minLength={2}
                  className="w-full border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#17221d] outline-none transition focus:border-[#245c4a] focus:ring-2 focus:ring-[#dceeff]"
                />
                <p className="mt-2 text-xs text-[#66736c]">
                  This is what staff will use to identify your hospital when
                  signing in.
                </p>
              </div>

              <div className="border-t border-[#dfe5df] pt-5">
                <p className="mb-4 text-sm font-semibold text-[#194536]">
                  Administrator account
                </p>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-[#17221d]"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                      required
                      minLength={2}
                      autoComplete="name"
                      className="w-full border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#17221d] outline-none transition focus:border-[#245c4a] focus:ring-2 focus:ring-[#dceeff]"
                    />
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
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@hospital.com"
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
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#17221d] outline-none transition focus:border-[#245c4a] focus:ring-2 focus:ring-[#dceeff]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#245c4a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#dceeff] hover:text-[#245c4a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating hospital..." : "Create hospital"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#66736c]">
              Already have a hospital account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#4f8fc7] transition hover:text-[#c94b4b]"
              >
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
