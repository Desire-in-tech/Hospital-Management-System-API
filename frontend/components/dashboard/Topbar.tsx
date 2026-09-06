"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface TopbarProps {
  role: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Hospital Administrator",
  doctor: "Doctor",
  patient: "Patient",
};

export default function Topbar({ role }: TopbarProps) {
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  return (
    <header className="border-b border-[#dfe5df] bg-white">
      <div className="flex min-h-16 items-center justify-between px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-[#194536]">
            {roleLabels[role]}
          </p>
          <p className="text-xs text-[#66736c]">CareFlow workspace</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-[#4f8fc7] transition hover:text-[#c94b4b]"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
