
"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RoleToggle } from "@/components/auth/RoleToggle";
import { PatientLoginForm } from "@/components/auth/PatientLoginForm";
import { DoctorLoginForm } from "@/components/auth/DoctorLoginForm";

export default function LoginPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-primary tracking-tight">MedConnect+</span>
      </div>

      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            {role === "patient" 
              ? "Access your health records and book appointments" 
              : "Access your medical dashboard and patient list"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Are you a...
              </label>
              <RoleToggle role={role} setRole={setRole} />
            </div>

            {role === "patient" ? <PatientLoginForm /> : <DoctorLoginForm />}

            <div className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Register here →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
