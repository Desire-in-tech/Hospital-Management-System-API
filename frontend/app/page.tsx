import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Patient records",
    description:
      "Keep patient information structured, secure and available to the people responsible for their care.",
  },
  {
    number: "02",
    title: "Appointments",
    description:
      "Coordinate doctors, patients and schedules without relying on disconnected systems.",
  },
  {
    number: "03",
    title: "Clinical records",
    description:
      "Give clinicians a clear view of medical history, consultations and ongoing care.",
  },
  {
    number: "04",
    title: "Prescriptions",
    description:
      "Keep prescriptions connected to the patient's clinical record and care journey.",
  },
];

const roles = [
  {
    title: "Hospital administrators",
    description:
      "Manage people, departments and hospital operations from one place.",
  },
  {
    title: "Doctors",
    description:
      "Spend less time navigating systems and more time focused on patients.",
  },
  {
    title: "Patients",
    description:
      "Access appointments and personal medical information through a simpler experience.",
  },
];

function CareFlowMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#245c4a]">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 5V19M5 12H19"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M18.5 5.5C20.1 7.1 21 9.3 21 12C21 17 17 21 12 21"
            stroke="#9FC2AD"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span className="text-[20px] font-semibold tracking-[-0.04em] text-[#17221d]">
        CareFlow
      </span>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12H19M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#17221d]">
      {/* Navigation */}
      <header className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" aria-label="CareFlow home">
            <CareFlowMark />
          </Link>

          <nav className="hidden items-center gap-9 text-sm md:flex">
            <a
              className="text-[#4f8fc7] transition hover:text-[#c94b4b]"
              href="#platform"
            >
              Platform
            </a>

            <a
              className="text-[#4f8fc7] transition hover:text-[#c94b4b]"
              href="#hospitals"
            >
              For hospitals
            </a>

            <a
              className="text-[#4f8fc7] transition hover:text-[#c94b4b]"
              href="#about"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden px-3 py-2 text-sm font-medium text-[#4f8fc7] transition hover:text-[#c94b4b] sm:block"
            >
              Sign in
            </a>

            <a
              href="/register"
              className="rounded-md bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a]"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-7 text-sm font-medium uppercase tracking-[0.16em] text-[#245c4a]">
              Hospital management, thoughtfully connected
            </p>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#17221d] sm:text-6xl lg:text-[76px]">
              Better systems.
              <br />
              <span className="text-[#245c4a]">Better care.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-[#66736c]">
              CareFlow brings the essential work of a hospital into one
              dependable platform — from patient records and appointments to
              clinical care and prescriptions.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#245c4a] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a]"
              >
                Get started
                <ArrowIcon />
              </a>

              <a
                href="#platform"
                className="inline-flex items-center justify-center rounded-md border border-[#cfd8d1] bg-white px-6 py-3.5 text-sm font-medium text-[#4f8fc7] transition hover:border-[#c94b4b] hover:text-[#c94b4b]"
              >
                Explore the platform
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#66736c]">
              <span>Patient management</span>
              <span>Appointments</span>
              <span>Clinical records</span>
              <span>Prescriptions</span>
            </div>
          </div>

          {/* Clinical dashboard preview */}
          <div className="flex items-end lg:justify-end">
            <div className="w-full max-w-md border border-[#d5ddd7] bg-[#eef6f1]">
              <div className="flex items-center justify-between border-b border-[#d5ddd7] px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#66736c]">
                    Care overview
                  </p>

                  <p className="mt-1 text-base font-semibold text-[#17221d]">
                    Today
                  </p>
                </div>

                <div className="h-2.5 w-2.5 rounded-full bg-[#3f7659]" />
              </div>

              <div className="grid grid-cols-2 border-b border-[#d5ddd7]">
                <div className="border-r border-[#d5ddd7] p-6">
                  <p className="text-sm text-[#66736c]">Patients</p>

                  <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    248
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-sm text-[#66736c]">Appointments</p>

                  <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    36
                  </p>
                </div>
              </div>

              <div className="p-6">
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.12em] text-[#66736c]">
                  Upcoming
                </p>

                <div className="space-y-4">
                  {[
                    ["09:30", "Sarah Nakato", "General consultation"],
                    ["11:00", "David Okello", "Follow-up"],
                    ["14:30", "Mary Atim", "Clinical review"],
                  ].map(([time, name, type]) => (
                    <div
                      key={`${time}-${name}`}
                      className="flex items-center justify-between border-b border-[#d5ddd7] pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#17221d]">
                          {name}
                        </p>

                        <p className="mt-1 text-xs text-[#66736c]">{type}</p>
                      </div>

                      <span className="text-xs font-medium text-[#245c4a]">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#245c4a]">
                The platform
              </p>

              <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                The essentials, connected.
              </h2>

              <p className="mt-5 max-w-md leading-7 text-[#66736c]">
                One system for the operational and clinical workflows that
                keep a hospital moving.
              </p>
            </div>

            <div className="grid border-l border-[#dfe5df] sm:grid-cols-2">
              {capabilities.map((capability) => (
                <div
                  key={capability.number}
                  className="border-b border-[#dfe5df] p-7 sm:nth-last-2:border-b-0"
                >
                  <span className="text-xs font-medium tracking-[0.12em] text-[#4f8fc7]">
                    {capability.number}
                  </span>

                  <h3 className="mt-5 text-lg font-semibold text-[#17221d]">
                    {capability.title}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#66736c]">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="hospitals" className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#245c4a]">
              Built around people
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              One platform. Different responsibilities.
            </h2>
          </div>

          <div className="mt-12 grid gap-px border border-[#dfe5df] bg-[#dfe5df] md:grid-cols-3">
            {roles.map((role) => (
              <div key={role.title} className="bg-[#eef6f1] p-8">
                <h3 className="text-lg font-semibold text-[#17221d]">
                  {role.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#66736c]">
                  {role.description}
                </p>

                <a
                  href="/register"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#4f8fc7] transition hover:text-[#c94b4b]"
                >
                  Get started
                  <ArrowIcon />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="bg-[#245c4a]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 px-6 py-16 lg:flex-row lg:items-center lg:px-10 lg:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#dceeff]">
              CareFlow
            </p>

            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              A clearer way to manage care.
            </h2>
          </div>

          <a
            href="/register"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-medium text-[#245c4a] transition hover:bg-[#dceeff]"
          >
            Get started
            <ArrowIcon />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dfe5df] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <CareFlowMark />

          <p className="text-sm text-[#66736c]">
            Hospital management, thoughtfully connected.
          </p>
        </div>
      </footer>
    </main>
  );
}
