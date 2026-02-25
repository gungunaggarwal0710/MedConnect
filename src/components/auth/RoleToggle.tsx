
"use client";

import { cn } from "@/lib/utils";
import { User, Stethoscope } from "lucide-react";

interface RoleToggleProps {
  role: "patient" | "doctor";
  setRole: (role: "patient" | "doctor") => void;
}

export function RoleToggle({ role, setRole }: RoleToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <button
        onClick={() => setRole("patient")}
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
          role === "patient"
            ? "border-primary bg-primary/10 text-primary shadow-sm"
            : "border-muted bg-white text-muted-foreground hover:bg-muted/5"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
          role === "patient" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
        )}>
          <User className="h-6 w-6" />
        </div>
        <span className="font-bold text-sm">PATIENT</span>
      </button>

      <button
        onClick={() => setRole("doctor")}
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
          role === "doctor"
            ? "border-primary bg-primary/10 text-primary shadow-sm"
            : "border-muted bg-white text-muted-foreground hover:bg-muted/5"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
          role === "doctor" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
        )}>
          <Stethoscope className="h-6 w-6" />
        </div>
        <span className="font-bold text-sm">DOCTOR</span>
      </button>
    </div>
  );
}
