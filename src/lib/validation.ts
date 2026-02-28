
import { z } from "zod";

export const patientLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const doctorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const patientRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().length(10, "Phone number must be 10 digits"),
  age: z.coerce.number().min(0).max(120),
  emergencyContactName: z.string().min(2, "Contact name required"),
  emergencyContactPhone: z.string().length(10, "Contact phone must be 10 digits"),
});

export const doctorRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().length(10, "Phone number must be 10 digits"),
  licenseNumber: z.string().min(5, "Valid license number required"),
  specialty: z.string().min(2, "Please select a specialty"),
  hospitalId: z.string().min(1, "Please select a hospital"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type PatientLoginValues = z.infer<typeof patientLoginSchema>;
export type DoctorLoginValues = z.infer<typeof doctorLoginSchema>;
export type PatientRegisterValues = z.infer<typeof patientRegisterSchema>;
export type DoctorRegisterValues = z.infer<typeof doctorRegisterSchema>;
