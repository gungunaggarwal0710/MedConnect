"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientLoginSchema, type PatientLoginValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function PatientLoginForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  const form = useForm<PatientLoginValues>({
    resolver: zodResolver(patientLoginSchema),
    defaultValues: {
      phone: "",
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

  async function handleSendOtp(data: PatientLoginValues) {
    setLoading(true);
    try {
      const phoneNumber = `+91${data.phone}`;
      if (!recaptchaVerifier.current) throw new Error("Recaptcha not initialized");
      
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current);
      setConfirmationResult(result);
      setShowOtp(true);
      toast({ title: "OTP Sent", description: "Please check your messages." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(data: PatientLoginValues) {
    if (!confirmationResult || !data.otp) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(data.otp);
      toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ title: "Invalid OTP", description: "Please check the code and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(showOtp ? handleVerifyOtp : handleSendOtp)} className="space-y-4">
        <div ref={recaptchaRef} />
        
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
                    placeholder="9876543210" 
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

        {showOtp && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter 6-digit OTP</FormLabel>
                <FormControl>
                  <Input placeholder="123456" {...field} maxLength={6} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full bg-primary" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {showOtp ? "Verify OTP" : "Send OTP"}
        </Button>
        
        {showOtp && (
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-xs" 
            onClick={() => setShowOtp(false)}
            disabled={loading}
          >
            Change Phone Number
          </Button>
        )}
      </form>
    </Form>
  );
}
