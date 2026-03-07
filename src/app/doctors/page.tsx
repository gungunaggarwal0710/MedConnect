
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Filter,
  Stethoscope,
  Heart,
  Baby,
  Brain,
  Eye,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const specialties = [
  { name: "Internal Medicine", icon: Stethoscope },
  { name: "Cardiology", icon: Heart },
  { name: "Pediatrics", icon: Baby },
  { name: "Neurology", icon: Brain },
  { name: "Ophthalmology", icon: Eye },
];

const mockDoctors = [
  { 
    id: 1, 
    name: "Dr. Sandeep Budhiraja", 
    specialty: "Internal Medicine", 
    rating: 4.9, 
    reviews: 450, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: "₹1500", 
    availability: "Today" 
  },
  { 
    id: 2, 
    name: "Dr. Balbir Singh", 
    specialty: "Cardiology", 
    rating: 5.0, 
    reviews: 1200, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: "₹2000", 
    availability: "Tomorrow" 
  },
  { 
    id: 3, 
    name: "Dr. S. K. Gupta", 
    specialty: "Neurology", 
    rating: 4.8, 
    reviews: 310, 
    location: "Batra Hospital, Tughlakabad", 
    fee: "₹1200", 
    availability: "Today" 
  },
  { 
    id: 4, 
    name: "Dr. (Brig) P. K. Tyagi", 
    specialty: "Orthopaedics", 
    rating: 4.7, 
    reviews: 185, 
    location: "Batra Hospital, Tughlakabad", 
    fee: "₹1000", 
    availability: "Next Week" 
  },
  { 
    id: 5, 
    name: "Dr. Archana Dhawan Bajaj", 
    specialty: "Gynaecology", 
    rating: 4.9, 
    reviews: 640, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: "₹1500", 
    availability: "Tomorrow" 
  },
];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");

  const filteredDoctors = mockDoctors.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">Find a Specialist</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search doctors by name or specialty..." 
                className="pl-10 bg-white border-none shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-white border-none shadow-sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {specialties.map((spec, i) => (
            <button 
              key={i} 
              className="flex flex-col items-center gap-2 min-w-[120px] p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <spec.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-center">{spec.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <Card key={doc.id} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex p-6 gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden relative border">
                    <img 
                      src={`https://picsum.photos/seed/doc${doc.id}/200/200`} 
                      alt={doc.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg leading-tight">{doc.name}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-[9px] uppercase font-bold">
                        {doc.availability}
                      </Badge>
                    </div>
                    <p className="text-primary text-sm font-medium">{doc.specialty}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-foreground">{doc.rating}</span>
                      <span>({doc.reviews} reviews)</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {doc.location}</span>
                      <span className="font-bold text-primary">{doc.fee} / consultation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-4 border-t border-muted flex justify-between gap-3">
                <Button variant="outline" size="sm" className="flex-1 bg-white">Profile</Button>
                <Button size="sm" className="flex-1 bg-primary text-white">Book Appointment</Button>
              </CardFooter>
            </Card>
          ))}
          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-24 text-muted-foreground bg-white rounded-3xl border-2 border-dashed">
              <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No specialists found matching your criteria.</p>
              <Button variant="link" onClick={() => setSearch("")}>Clear Search</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
