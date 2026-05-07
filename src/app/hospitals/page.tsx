
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
  Search,
  ExternalLink,
  Filter,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";

export const hospitals = [
  {
    id: 1,
    name: "Max Super Speciality Hospital",
    location: "Saket, New Delhi",
    region: "Delhi",
    phone: "+911126515050",
    address: "1-2, Press Enclave Road, Saket, New Delhi, Delhi 110017",
    beds: 120,
    icu: 24,
    ventilators: 12,
    distance: "0.8 km",
    rating: 4.9,
    verified: true,
    acceptedInsurance: ["LIC", "Apollo Munich", "Star Health", "HDFC ERGO", "Max Bupa", "CGHS"]
  },
  {
    id: 2,
    name: "Indraprastha Apollo Hospital",
    location: "Sarita Vihar, New Delhi",
    region: "Delhi",
    phone: "+911171791090",
    address: "Mathura Rd, Sarita Vihar, New Delhi, Delhi 110076",
    beds: 150,
    icu: 40,
    ventilators: 20,
    distance: "3.2 km",
    rating: 4.8,
    verified: true,
    acceptedInsurance: ["Apollo Munich", "Star Health", "ICICI Lombard", "Religare", "CGHS"]
  },
  {
    id: 7,
    name: "Kailash Hospital & Heart Institute",
    location: "Sector 27, Noida",
    region: "Noida",
    phone: "+911202444444",
    address: "H-33, Sector 27, Noida, Uttar Pradesh 201301",
    beds: 100,
    icu: 20,
    ventilators: 10,
    distance: "1.2 km",
    rating: 4.8,
    verified: true,
    acceptedInsurance: ["LIC", "Star Health", "CGHS", "HDFC ERGO"]
  },
  {
    id: 8,
    name: "Fortis Hospital Noida",
    location: "Sector 62, Noida",
    region: "Noida",
    phone: "+911206622222",
    address: "B-22, Sector 62, Noida, Uttar Pradesh 201301",
    beds: 130,
    icu: 35,
    ventilators: 18,
    distance: "4.5 km",
    rating: 4.7,
    verified: true,
    acceptedInsurance: ["Max Bupa", "Cigna TTK", "Star Health", "Religare"]
  },
  {
    id: 9,
    name: "Jaypee Hospital",
    location: "Sector 128, Noida",
    region: "Noida",
    phone: "+911204122222",
    address: "Wish Town, Sector 128, Noida, Uttar Pradesh 201304",
    beds: 150,
    icu: 45,
    ventilators: 25,
    distance: "9.8 km",
    rating: 4.9,
    verified: true,
    acceptedInsurance: ["Apollo Munich", "Star Health", "ICICI Lombard", "Religare"]
  },
  {
    id: 3,
    name: "Batra Hospital & Medical Research Centre",
    location: "Tughlakabad, New Delhi",
    region: "Delhi",
    phone: "+911129958747",
    address: "1, Mehrauli - Badarpur Rd, Tughlakabad Institutional Area, Vayusenabad, New Delhi, Delhi 110062",
    beds: 85,
    icu: 15,
    ventilators: 6,
    distance: "1.4 km",
    rating: 4.7,
    verified: true,
    acceptedInsurance: ["Star Health", "NICL", "Reliance General", "HDFC ERGO", "CGHS"]
  },
  {
    id: 4,
    name: "Fortis Memorial Research Institute",
    location: "Sector 44, Gurugram",
    region: "Gurugram",
    phone: "+911244962200",
    address: "Sector - 44, Opposite HUDA City Centre, Gurugram, Haryana 122002",
    beds: 110,
    icu: 30,
    ventilators: 15,
    distance: "12.5 km",
    rating: 4.8,
    verified: true,
    acceptedInsurance: ["Max Bupa", "Cigna TTK", "Star Health", "Religare"]
  },
  {
    id: 10,
    name: "Metro Hospital & Heart Institute",
    location: "Sector 11, Noida",
    region: "Noida",
    phone: "+911204366666",
    address: "L-94, Sector 11, Noida, Uttar Pradesh 201301",
    beds: 80,
    icu: 15,
    ventilators: 5,
    distance: "2.1 km",
    rating: 4.6,
    verified: true,
    acceptedInsurance: ["Star Health", "NICL", "Reliance General", "CGHS"]
  },
  {
    id: 5,
    name: "Sir Ganga Ram Hospital",
    location: "Rajinder Nagar, New Delhi",
    region: "Delhi",
    phone: "+911125750000",
    address: "Sir Ganga Ram Hospital Marg, Old Rajinder Nagar, Rajinder Nagar, New Delhi, Delhi 110060",
    beds: 95,
    icu: 18,
    ventilators: 8,
    distance: "8.2 km",
    rating: 4.6,
    verified: true,
    acceptedInsurance: ["LIC", "National Insurance", "CGHS", "Star Health"]
  },
  {
    id: 6,
    name: "AIIMS Delhi",
    location: "Ansari Nagar, New Delhi",
    region: "Delhi",
    phone: "+911126588500",
    address: "Ansari Nagar, Ansari Nagar East, New Delhi, Delhi 110029",
    beds: 40,
    icu: 5,
    ventilators: 2,
    distance: "5.5 km",
    rating: 4.9,
    verified: true,
    acceptedInsurance: ["Government", "CGHS", "ECHS"]
  }
];

const regions = ["All", "Delhi", "Noida", "Gurugram"];

export default function HospitalsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                          h.location.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = selectedRegion === "All" || h.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [search, selectedRegion]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hospital Network</h1>
          <p className="text-muted-foreground">Live tracking of available resources and specialist facilities in the NCR region.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by hospital name or area..." 
              className="pl-10 bg-white border-none shadow-md h-12 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-xl shadow-md border flex items-center h-12">
              <div className="px-3 text-muted-foreground">
                <Filter className="h-4 w-4" />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[150px] border-none shadow-none h-full bg-transparent focus:ring-0">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(search || selectedRegion !== "All") && (
              <Button 
                variant="ghost" 
                className="text-primary font-bold"
                onClick={() => {
                  setSearch("");
                  setSelectedRegion("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {filteredHospitals.map((hosp) => (
              <Card key={hosp.id} className="border-none shadow-md overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{hosp.name}</CardTitle>
                        {hosp.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {hosp.location}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px] font-bold bg-white">{hosp.distance}</Badge>
                      <Badge className="bg-primary/10 text-primary text-[9px] border-none uppercase font-black">{hosp.region}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-secondary/40 p-3 rounded-xl text-center">
                      <Activity className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">General</p>
                      <p className={cn("text-lg font-bold", hosp.beds > 0 ? "text-foreground" : "text-destructive")}>
                        {hosp.beds || "Full"}
                      </p>
                    </div>
                    <div className="bg-secondary/40 p-3 rounded-xl text-center">
                      <Activity className="h-4 w-4 text-red-600 mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">ICU</p>
                      <p className={cn("text-lg font-bold", hosp.icu > 0 ? "text-foreground" : "text-destructive")}>
                        {hosp.icu || "Full"}
                      </p>
                    </div>
                    <div className="bg-secondary/40 p-3 rounded-xl text-center">
                      <Wind className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Ventilator</p>
                      <p className={cn("text-lg font-bold", hosp.ventilators > 0 ? "text-foreground" : "text-destructive")}>
                        {hosp.ventilators || "None"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Empanelled Insurance / CGHS</p>
                    <div className="flex flex-wrap gap-1">
                      {hosp.acceptedInsurance.map((ins) => (
                        <Badge key={ins} variant="secondary" className="bg-primary/5 text-primary text-[9px] py-0 px-2 border-primary/10">
                          {ins}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-white hover:bg-primary/5 border-primary/20 text-primary font-bold"
                      asChild
                    >
                      <a href={`tel:${hosp.phone}`}>
                        <Phone className="h-4 w-4 mr-2" /> Call Desk
                      </a>
                    </Button>
                    <Button 
                      className="flex-1 bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all"
                      asChild
                    >
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.name + ' ' + hosp.address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <NavIcon className="h-4 w-4 mr-2" /> View Route
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredHospitals.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="font-bold">No hospitals found</p>
                <p className="text-sm text-muted-foreground">Try searching for a different area or name.</p>
              </div>
            )}
          </div>

          <div className="hidden lg:block h-[calc(100vh-200px)] sticky top-24 bg-white rounded-3xl shadow-xl overflow-hidden border">
            <div className="w-full h-full relative bg-muted flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-100/50">
                <div className="absolute top-10 left-10 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-bounce" />
                <div className="absolute top-40 left-60 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg" />
                <div className="absolute bottom-20 right-20 w-8 h-8 bg-destructive rounded-full border-4 border-white shadow-lg" />
                <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg" />
              </div>
              <p className="text-muted-foreground font-bold relative z-10 flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Live Map Overview
              </p>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Showing {selectedRegion} facilities</p>
                  <p className="text-[10px] text-muted-foreground">NCR Metropolitan Region</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  Refresh Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
