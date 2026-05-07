
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldAlert, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Stethoscope,
  HeartPulse,
  UserPlus,
  Hospital,
  ShieldCheck,
  Bot,
  Sparkles,
  Users
} from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useUser } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { hospitals, mockDoctors } from "@/lib/mock-data";
import { useMemo } from "react";

export default function Home() {
  const { user } = useUser();

  const totalBeds = useMemo(() => {
    return hospitals.reduce((acc, curr) => acc + (curr.beds || 0), 0);
  }, []);

  const totalDoctors = useMemo(() => {
    return mockDoctors.length;
  }, []);

  const insuranceHospitalsCount = useMemo(() => {
    return hospitals.filter(h => h.acceptedInsurance && h.acceptedInsurance.length > 0).length;
  }, []);

  return (
    <div className="pb-24 pt-4 md:pt-24 bg-background min-h-screen">
      <Navigation />
      
      {/* Floating AI Health Assistant Avatar */}
      <Link 
        href="/ai-chat" 
        className="fixed bottom-24 right-6 z-50 md:bottom-10 md:right-10 group"
      >
        <div className="relative">
          <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping group-hover:animate-none" />
          <div className="relative bg-primary p-4 rounded-full shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
            AI
          </div>
          
          {/* Tooltip-like label */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-primary/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
            <p className="text-xs font-bold text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Ask Health Assistant
            </p>
          </div>
        </div>
      </Link>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary px-4 py-1.5 text-sm font-bold rounded-full">
                  AI-Powered Healthcare Ecosystem
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
                  Your Health, <span className="text-primary">Connected.</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Get instant medical assistance, AI-driven symptom analysis, and seamless hospital booking.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white animate-pulse-red shadow-xl h-14 px-8 text-lg font-bold">
                  <Link href="/emergency">
                    <ShieldAlert className="mr-2 h-6 w-6" />
                    EMERGENCY SOS
                  </Link>
                </Button>
                
                {!user ? (
                  <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 h-14 px-8 text-lg font-bold">
                    <Link href="/register">
                      <UserPlus className="mr-2 h-6 w-6" />
                      Join Now
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 h-14 px-8 text-lg font-bold">
                    <Link href="/dashboard">
                      My Dashboard
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="relative hidden md:block aspect-square max-h-[500px]">
              <div className="absolute -inset-4 bg-primary/5 rounded-full animate-pulse" />
              <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl border-8 border-white">
                <Image 
                  src={PlaceHolderImages[0].imageUrl} 
                  alt="Healthcare" 
                  fill 
                  className="object-cover"
                  data-ai-hint="doctor clinic"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12">
          {[
            { label: "Book Appointment", icon: Calendar, color: "bg-blue-100 text-blue-600", href: "/doctors" },
            { label: "Find Hospitals", icon: MapPin, color: "bg-green-100 text-green-600", href: "/hospitals" },
            { label: "AI Symptom Analysis", icon: MessageSquare, color: "bg-primary/10 text-primary", href: "/ai-chat" },
            { label: "Manage Insurance", icon: ShieldCheck, color: "bg-purple-100 text-purple-600", href: "/insurance" },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center h-full border-none shadow-sm group">
                <CardContent className="pt-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${action.color}`}>
                    <action.icon className="h-8 w-8" />
                  </div>
                  <span className="font-bold text-base block group-hover:text-primary transition-colors">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 py-12">
          <Card className="border-none shadow-md overflow-hidden bg-white group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Hospital className="h-5 w-5" /></div>
                <Badge className="bg-green-100 text-green-800 border-none">LIVE</Badge>
              </div>
              <CardTitle className="text-lg">Network Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">{hospitals.length}</span>
                <Link href="/hospitals" className="text-primary text-sm font-bold flex items-center">
                  View Map <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-white group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Users className="h-5 w-5" /></div>
                <Badge variant="outline">TOTAL</Badge>
              </div>
              <CardTitle className="text-lg text-blue-600">Specialists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">{totalDoctors}</span>
                <Link href="/doctors" className="text-blue-600 text-sm font-bold flex items-center">
                  Search <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-white group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-600"><HeartPulse className="h-5 w-5" /></div>
                <Badge variant="outline">TOTAL</Badge>
              </div>
              <CardTitle className="text-lg text-green-600">Available Beds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">{totalBeds}</span>
                <Link href="/hospitals" className="text-green-600 text-sm font-bold flex items-center">
                  Details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-white group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><ShieldCheck className="h-5 w-5" /></div>
                <Badge className="bg-purple-100 text-purple-800 border-none">COVERED</Badge>
              </div>
              <CardTitle className="text-lg text-purple-600">Insurance Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">{insuranceHospitalsCount}</span>
                <Link href="/insurance" className="text-purple-600 text-sm font-bold flex items-center">
                  Policies <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-destructive/5 group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><Stethoscope className="h-5 w-5" /></div>
                <Badge className="bg-destructive text-white border-none">URGENT</Badge>
              </div>
              <CardTitle className="text-lg text-destructive">Emergency ETA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">8 <span className="text-lg text-muted-foreground font-medium">mins</span></span>
                <Link href="/emergency" className="text-destructive text-sm font-bold flex items-center">
                  SOS Now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
