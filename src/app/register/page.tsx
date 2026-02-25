
"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RoleToggle } from "@/components/auth/RoleToggle";
import { PatientRegisterForm } from "@/components/auth/PatientRegisterForm";
import { DoctorRegisterForm } from "@/components/auth/DoctorRegisterForm";

export default function RegisterPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-primary tracking-tight">MedConnect+</span>
      </div>

      <Card className="w-full max-w-lg border-none shadow-xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join MedConnect+ and simplify your healthcare journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                I am a...
              </label>
              <RoleToggle role={role} setRole={setRole} />
            </div>

            {role === "patient" ? <PatientRegisterForm /> : <DoctorRegisterForm />}

            <div className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Login here →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
