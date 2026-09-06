"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAppointments, getDepartments, getDoctors, getMedicalRecords, getPatients, getPrescriptions } from "@/lib/api";
import { getToken, getTokenPayload } from "@/lib/auth";
import type { Appointment, Department, Doctor, MedicalRecord, Patient, Prescription, UserRole } from "@/lib/types";
import StatCard from "@/components/dashboard/StatCard";

const roleLabels: Record<UserRole, string> = {
  admin: "Hospital Administrator",
  doctor: "Doctor",
  patient: "Patient",
};

export default function DashboardPage() {
  const payload = getTokenPayload();
  const role = payload?.role ?? null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const token = getToken();

      if (!token || !role) {
        return;
      }

      try {
        setError("");

        const results = await Promise.all([
          getAppointments(token),
          role === "admin" || role === "doctor"
            ? getDoctors(token)
            : Promise.resolve([]),
          getPatients(token),
          role === "admin" ? getDepartments(token) : Promise.resolve([]),
          getMedicalRecords(token),
          getPrescriptions(token),
        ]);

        setAppointments(results[0]);
        setDoctors(results[1]);
        setPatients(results[2]);
        setDepartments(results[3]);
        setRecords(results[4]);
        setPrescriptions(results[5]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [role]);

  if (!role) {
    return (
      <main className="px-6 py-12 lg:px-8">
        <p className="text-sm text-[#66736c]">Loading your workspace...</p>
      </main>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-[#dfe5df] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8fc7]">
            Overview
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#17221d]">
            {roleLabels[role]}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66736c]">
            Manage hospital operations, appointments, clinical records, and
            patient care from one workspace.
          </p>
        </div>

        {error && (
          <div className="mt-6 border border-[#c94b4b] bg-[#fff5f5] px-4 py-3 text-sm text-[#a94b4b]">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {role === "admin" && (
            <>
              <StatCard
                label="Patients"
                value={loading ? "—" : patients.length}
                description="Patients in your hospital"
              />
              <StatCard
                label="Doctors"
                value={loading ? "—" : doctors.length}
                description="Clinical staff"
              />
              <StatCard
                label="Departments"
                value={loading ? "—" : departments.length}
                description="Hospital departments"
              />
              <StatCard
                label="Appointments"
                value={loading ? "—" : appointments.length}
                description="Appointments across the hospital"
              />
            </>
          )}

          {role === "doctor" && (
            <>
              <StatCard
                label="Appointments"
                value={loading ? "—" : appointments.length}
                description="Your appointments"
              />
              <StatCard
                label="Patients"
                value={loading ? "—" : patients.length}
                description="Patients in your hospital"
              />
              <StatCard
                label="Medical Records"
                value={loading ? "—" : records.length}
                description="Clinical records available to you"
              />
              <StatCard
                label="Prescriptions"
                value={loading ? "—" : prescriptions.length}
                description="Prescriptions"
              />
            </>
          )}

          {role === "patient" && (
            <>
              <StatCard
                label="Appointments"
                value={loading ? "—" : appointments.length}
                description="Your appointments"
              />
              <StatCard
                label="Medical Records"
                value={loading ? "—" : records.length}
                description="Your medical records"
              />
              <StatCard
                label="Prescriptions"
                value={loading ? "—" : prescriptions.length}
                description="Your prescriptions"
              />
              <StatCard
                label="Care"
                value="Active"
                description="Your CareFlow workspace"
              />
            </>
          )}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="border border-[#dfe5df] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#194536]">
              Quick actions
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/appointments"
                className="border border-[#245c4a] bg-[#245c4a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dceeff] hover:text-[#245c4a]"
              >
                Appointments
              </Link>

              {(role === "admin" || role === "doctor") && (
                <Link
                  href="/dashboard/medical-records"
                  className="border border-[#dfe5df] px-4 py-2.5 text-sm font-medium text-[#245c4a] transition hover:bg-[#eef6f1]"
                >
                  Medical records
                </Link>
              )}

              {role === "patient" && (
                <Link
                  href="/dashboard/appointments/new"
                  className="border border-[#dfe5df] px-4 py-2.5 text-sm font-medium text-[#245c4a] transition hover:bg-[#eef6f1]"
                >
                  Book appointment
                </Link>
              )}

              {role === "admin" && (
                <Link
                  href="/dashboard/patients/new"
                  className="border border-[#dfe5df] px-4 py-2.5 text-sm font-medium text-[#245c4a] transition hover:bg-[#eef6f1]"
                >
                  Add patient
                </Link>
              )}
            </div>
          </div>

          <div className="border border-[#dfe5df] bg-[#eef6f1] p-6">
            <h2 className="text-lg font-semibold text-[#194536]">
              CareFlow
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#66736c]">
              A unified hospital workspace designed to keep administrative
              and clinical workflows organized, secure, and accessible.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
