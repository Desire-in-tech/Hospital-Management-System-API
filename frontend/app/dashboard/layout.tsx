"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokenPayload } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const payload = getTokenPayload();
  const role = payload?.role ?? null;

  useEffect(() => {
    if (!payload) {
      router.replace("/login");
    }
  }, [payload, router]);

  if (!role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-[#66736c]">Loading your workspace...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        <Sidebar role={role} />

        <div className="min-w-0 flex-1">
          <Topbar role={role} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
