"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Activity, 
  Wind, 
  ShieldCheck, 
  Navigation as NavIcon,
  Phone,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

const hospitals = [
  {
    id: 1,
    name: "Apollo Multispecialty",
    location: "New Delhi, Sarita Vihar",
    beds: 42,
    icu: 8,
    ventilators: 3,
    distance: "1.2 km",
    rating: 4.8,
    verified: true
  },
  {
    id: 2,
    name: "Fortis Hospital",
    location: "Gurugram, Sector 44",
    beds: 15,
    icu: 2,
    ventilators: 1,
    distance: "3.5 km",
    rating: 4.6,
    verified: true
  },
  {
    id: 3,
    name: "Max Healthcare",
    location: "Saket, New Delhi",
    beds: 0,
    icu: 0,
    ventilators: 0,
    distance: "5.8 km",
    rating: 4.7,
    verified: true
  }
];

export default function HospitalsPage() {
  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hospital Bed Tracker</h1>
          <p className="text-muted-foreground">Real-time bed, ICU, and ventilator availability.</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search city, hospital name..." 
            className="pl-10 bg-white border-none shadow-md h-12"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List Section */}
          <div className="space-y-6">
            {hospitals.map((hosp) => (
              <Card key={hosp.id} className="border-none shadow-md overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{hosp.name}</CardTitle>
                        {hosp.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {hosp.location}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{hosp.distance}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-secondary/50 p-3 rounded-xl text-center">
                      <Activity className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">General</p>
                      <p className={cn("text-lg font-bold", hosp.beds > 0 ? "text-foreground" : "text-destructive")}>
                        {hosp.beds || "Full"}
                      </p>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-xl text-center">
                      <Activity className="h-4 w-4 text-red-600 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">ICU</p>
                      <p className={cn("text-lg font-bold", hosp.icu > 0 ? "text-foreground" : "text-destructive")}>
                        {hosp.icu || "Full"}
                      </p>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-xl text-center">
                      <Wind className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Ventilator</p>
                      <p className={cn("text-lg font-bold", hosp.ventilators > 0 ? "text-foreground" : "text-destructive")}>
                        {hosp.ventilators || "None"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-white"><Phone className="h-4 w-4 mr-2" /> Call</Button>
                    <Button className="flex-1 bg-primary text-white"><NavIcon className="h-4 w-4 mr-2" /> Route</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map Section Simulation */}
          <div className="hidden lg:block h-[calc(100vh-200px)] sticky top-24 bg-white rounded-3xl shadow-xl overflow-hidden border">
            <div className="w-full h-full relative bg-muted flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-100/50">
                {/* Simulated map UI elements */}
                <div className="absolute top-10 left-10 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-bounce" />
                <div className="absolute top-40 left-60 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg" />
                <div className="absolute bottom-20 right-20 w-8 h-8 bg-destructive rounded-full border-4 border-white shadow-lg" />
              </div>
              <p className="text-muted-foreground font-bold relative z-10 flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Interactive Map Interface
              </p>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Showing hospitals near you</p>
                  <p className="text-[10px] text-muted-foreground">Within 10 km radius</p>
                </div>
                <Button size="sm" variant="outline">Refresh</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}