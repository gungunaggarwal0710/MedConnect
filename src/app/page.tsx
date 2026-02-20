"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShieldAlert, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Droplets,
  Video
} from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default function Home() {
  return (
    <div className="pb-24 pt-4 md:pt-24 bg-background min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Your Health, <span className="text-primary">Connected.</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Get instant medical assistance, AI-driven symptom analysis, and seamless hospital booking in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white animate-pulse-red shadow-lg">
                  <Link href="/emergency">
                    <ShieldAlert className="mr-2 h-5 w-5" />
                    EMERGENCY SOS
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                  <Link href="/ai-chat">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Check Symptoms
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block aspect-video overflow-hidden rounded-2xl shadow-2xl">
              <Image 
                src={PlaceHolderImages[0].imageUrl} 
                alt="Healthcare" 
                fill 
                className="object-cover"
                data-ai-hint="doctor clinic"
              />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {[
            { label: "Book Appointment", icon: Calendar, color: "bg-blue-100 text-blue-600", href: "/doctors" },
            { label: "Find Hospitals", icon: MapPin, color: "bg-green-100 text-green-600", href: "/hospitals" },
            { label: "Blood Donors", icon: Droplets, color: "bg-red-100 text-red-600", href: "/blood-donors" },
            { label: "First Aid Videos", icon: Video, color: "bg-purple-100 text-purple-600", href: "/first-aid" },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer text-center h-full border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3", action.color)}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-sm">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {/* Live Status Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Hospital Beds 
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live</span>
              </CardTitle>
              <CardDescription>Available nearby in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold">142</span>
                <Link href="/hospitals" className="text-primary text-sm flex items-center hover:underline">
                  View Map <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Your Health Score
                <HeartPulse className="h-5 w-5 text-blue-500" />
              </CardTitle>
              <CardDescription>Based on recent checkups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold">84/100</span>
                <Link href="/dashboard" className="text-primary text-sm flex items-center hover:underline">
                  Details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Emergency Nearby
                <Stethoscope className="h-5 w-5 text-red-500" />
              </CardTitle>
              <CardDescription>Estimated response time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold">8 mins</span>
                <Link href="/emergency" className="text-destructive text-sm flex items-center hover:underline">
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}