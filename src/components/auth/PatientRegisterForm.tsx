"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientRegisterSchema, type PatientRegisterValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function PatientRegisterForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  const form = useForm<PatientRegisterValues & { otp?: string }>({
    resolver: zodResolver(patientRegisterSchema.extend({ otp: z.string().optional() })),
    defaultValues: {
      name: "",
      phone: "",
      age: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
      otp: "",
    },
  });

  useEffect(() => {
    if (!recaptchaVerifier.current && recaptchaRef.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: "invisible",
      });
    }
  }, [auth]);

  async function onSendOtp(data: PatientRegisterValues) {
    setLoading(true);
    try {
      const phoneNumber = `+91${data.phone}`;
      if (!recaptchaVerifier.current) throw new Error("Recaptcha not initialized");
      
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current);
      setConfirmationResult(result);
      setShowOtp(true);
      toast({ title: "OTP Sent", description: "Verification code sent to your phone." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function onCompleteRegister(data: PatientRegisterValues & { otp?: string }) {
    if (!confirmationResult || !data.otp) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(data.otp);
      const userId = result.user.uid;
      const userDocRef = doc(db, "users", userId);
      const userData = {
        id: userId,
        role: "patient",
        name: data.name,
        phone: data.phone,
        age: data.age,
        emergencyContacts: [
          { name: data.emergencyContactName, phone: data.emergencyContactPhone, relation: "Emergency" }
        ],
        createdAt: serverTimestamp(),
      };

      setDoc(userDocRef, userData)
        .then(() => {
          toast({ title: "Account Created!", description: "Welcome to MedConnect+." });
          router.push("/dashboard");
        })
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(showOtp ? onCompleteRegister : onSendOtp)} className="space-y-4">
        <div ref={recaptchaRef} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} disabled={showOtp || loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={showOtp || loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted rounded-md text-sm font-medium border border-input">+91</span>
                  <Input 
                    placeholder="" 
                    {...field} 
                    disabled={showOtp || loading}
                    maxLength={10}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/10 space-y-3">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <ShieldAlert className="h-4 w-4" /> EMERGENCY CONTACT
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Contact Name" {...field} disabled={showOtp || loading} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="" {...field} disabled={showOtp || loading} maxLength={10} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {showOtp && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-2">
                <FormLabel>Enter 6-digit OTP</FormLabel>
                <FormControl>
                  <Input placeholder="123456" {...field} maxLength={6} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full bg-primary h-12 text-lg" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {showOtp ? "Register Account" : "Verify Phone & Register"}
        </Button>
      </form>
    </Form>
  );
}
