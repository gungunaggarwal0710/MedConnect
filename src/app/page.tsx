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
  Video,
  UserPlus,
  Hospital,
  Activity
} from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useUser } from "@/firebase";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="pb-24 pt-4 md:pt-24 bg-background min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
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
                  Get instant medical assistance, AI-driven symptom analysis, and seamless hospital booking in one platform. Built for your safety.
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

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                      <img src={`https://picsum.photos/seed/${i}/40`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">10k+</span> active users trust us daily.
                </p>
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
              
              <div className="absolute -left-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><Stethoscope className="h-5 w-5 text-green-600" /></div>
                  <div className="text-xs">
                    <p className="font-bold">Verified Doctors</p>
                    <p className="text-muted-foreground">Top specialists</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Activity className="h-5 w-5 text-blue-600" /></div>
                  <div className="text-xs">
                    <p className="font-bold">Real-time Stats</p>
                    <p className="text-muted-foreground">Health tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12">
          {[
            { label: "Book Appointment", icon: Calendar, color: "bg-blue-100 text-blue-600", href: "/doctors" },
            { label: "Find Hospitals", icon: MapPin, color: "bg-green-100 text-green-600", href: "/hospitals" },
            { label: "AI Symptom Analysis", icon: MessageSquare, color: "bg-primary/10 text-primary", href: "/ai-chat" },
            { label: "First Aid Videos", icon: Video, color: "bg-purple-100 text-purple-600", href: "/dashboard" },
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

        {/* Live Status Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <Card className="border-none shadow-md overflow-hidden bg-white group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Hospital className="h-5 w-5" /></div>
                <Badge className="bg-green-100 text-green-800 border-none">LIVE</Badge>
              </div>
              <CardTitle className="text-lg">Hospital Beds</CardTitle>
              <CardDescription>Available nearby in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">142</span>
                <Link href="/hospitals" className="text-primary text-sm font-bold flex items-center group-hover:gap-2 transition-all">
                  View Map <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-white group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><HeartPulse className="h-5 w-5" /></div>
                <Badge variant="outline">MONTHLY</Badge>
              </div>
              <CardTitle className="text-lg text-blue-600">Health Score</CardTitle>
              <CardDescription>Based on recent activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">84<span className="text-lg text-muted-foreground font-medium">/100</span></span>
                <Link href="/dashboard" className="text-blue-600 text-sm font-bold flex items-center group-hover:gap-2 transition-all">
                  Details <ArrowRight className="ml-1 h-4 w-4" />
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
              <CardDescription>Nearest response team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-foreground">8 <span className="text-lg text-muted-foreground font-medium uppercase tracking-widest">mins</span></span>
                <Link href="/emergency" className="text-destructive text-sm font-bold flex items-center group-hover:gap-2 transition-all">
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
