"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

interface SidebarProps {
  role: UserRole;
}

const allNavigation = [
  { label: "Overview", href: "/dashboard", roles: ["admin", "doctor", "patient"] },
  { label: "Appointments", href: "/dashboard/appointments", roles: ["admin", "doctor", "patient"] },
  { label: "Patients", href: "/dashboard/patients", roles: ["admin", "doctor"] },
  { label: "Doctors", href: "/dashboard/doctors", roles: ["admin"] },
  { label: "Departments", href: "/dashboard/departments", roles: ["admin"] },
  { label: "Medical Records", href: "/dashboard/medical-records", roles: ["admin", "doctor", "patient"] },
  { label: "Prescriptions", href: "/dashboard/prescriptions", roles: ["admin", "doctor", "patient"] },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  patient: "Patient",
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navigation = allNavigation.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#dfe5df] bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-[#dfe5df] px-6 py-5">
          <Link href="/dashboard" className="inline-flex items-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#245c4a] text-lg font-semibold text-white">
              +
            </span>
            <span className="ml-3 text-lg font-semibold text-[#194536]">
              CareFlow
            </span>
          </Link>
        </div>

        <div className="px-4 py-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#66736c]">
            Workspace
          </p>

          <nav className="mt-3 space-y-1">
            {navigation.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#eef6f1] text-[#245c4a]"
                      : "text-[#66736c] hover:bg-[#eef6f1] hover:text-[#245c4a]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#dfe5df] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#66736c]">
            Signed in as
          </p>
          <p className="mt-1 text-sm font-medium text-[#194536]">
            {roleLabels[role]}
          </p>
        </div>
      </div>
    </aside>
  );
}
