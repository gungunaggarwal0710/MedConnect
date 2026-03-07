
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
  User,
  GraduationCap,
  History,
  Award,
  X,
  ChevronRight,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const specialties = [
  { name: "All", icon: Stethoscope },
  { name: "Internal Medicine", icon: Stethoscope },
  { name: "Cardiology", icon: Heart },
  { name: "Pediatrics", icon: Baby },
  { name: "Neurology", icon: Brain },
  { name: "Ophthalmology", icon: Eye },
  { name: "Orthopaedics", icon: User },
  { name: "Oncology", icon: Activity },
];

const hospitals = ["All", "Max Super Speciality Hospital, Saket", "Batra Hospital, Tughlakabad", "Max Hospital, Shalimar Bagh", "Batra Hospital, Okhla"];

const mockDoctors = [
  { 
    id: 1, 
    name: "Dr. Sandeep Budhiraja", 
    specialty: "Internal Medicine", 
    degree: "MBBS, MD (Internal Medicine)",
    experience: 28,
    rating: 4.9, 
    reviews: 450, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: 1500, 
    availability: "Today",
    about: "Group Medical Director at Max Healthcare with extensive experience in managing complex medical cases and infectious diseases."
  },
  { 
    id: 2, 
    name: "Dr. Balbir Singh", 
    specialty: "Cardiology", 
    degree: "MBBS, MD, DM (Cardiology)",
    experience: 35,
    rating: 5.0, 
    reviews: 1200, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: 2000, 
    availability: "Tomorrow",
    about: "Renowned Cardiologist specialized in interventional cardiology, electrophysiology, and complex angioplasties."
  },
  { 
    id: 3, 
    name: "Dr. S. K. Gupta", 
    specialty: "Neurology", 
    degree: "MBBS, MD, DM (Neurology)",
    experience: 32,
    rating: 4.8, 
    reviews: 310, 
    location: "Batra Hospital, Tughlakabad", 
    fee: 1200, 
    availability: "Today",
    about: "Expert in neuro-critical care, stroke management, and epilepsy treatments at Batra Hospital."
  },
  { 
    id: 4, 
    name: "Dr. (Brig) P. K. Tyagi", 
    specialty: "Orthopaedics", 
    degree: "MBBS, MS (Orthopaedics)",
    experience: 40,
    rating: 4.7, 
    reviews: 185, 
    location: "Batra Hospital, Tughlakabad", 
    fee: 1000, 
    availability: "Next Week",
    about: "Former Army Brigadier with decades of experience in trauma surgery, joint replacements, and sports injuries."
  },
  { 
    id: 5, 
    name: "Dr. Archana Dhawan Bajaj", 
    specialty: "Obstetrics & Gynaecology", 
    degree: "MBBS, DGO, DNB",
    experience: 22,
    rating: 4.9, 
    reviews: 640, 
    location: "Max Hospital, Shalimar Bagh", 
    fee: 1500, 
    availability: "Tomorrow",
    about: "Specialized in high-risk pregnancy, IVF, and minimally invasive laparoscopic surgeries."
  },
  { 
    id: 6, 
    name: "Dr. Vivek Kumar", 
    specialty: "Neurology", 
    degree: "MBBS, MD, DM",
    experience: 25,
    rating: 4.8, 
    reviews: 290, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: 1800, 
    availability: "Today",
    about: "Senior Director of Neurology with focus on Parkinson's disease and movement disorders."
  },
  { 
    id: 7, 
    name: "Dr. Harit Chaturvedi", 
    specialty: "Oncology", 
    degree: "MBBS, MS, MCh (Surgical Oncology)",
    experience: 30,
    rating: 5.0, 
    reviews: 890, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: 2500, 
    availability: "Today",
    about: "Chairman of Max Institute of Cancer Care, internationally recognized for complex cancer surgeries."
  },
  { 
    id: 8, 
    name: "Dr. Upasna Bagchi", 
    specialty: "Pediatrics", 
    degree: "MBBS, MD (Pediatrics)",
    experience: 15,
    rating: 4.7, 
    reviews: 150, 
    location: "Batra Hospital, Tughlakabad", 
    fee: 800, 
    availability: "Next Week",
    about: "Compassionate pediatrician with special interest in neonatology and child development."
  },
  { 
    id: 9, 
    name: "Dr. Rajiv Parakh", 
    specialty: "Peripheral Vascular Surgery", 
    degree: "MBBS, MS, FRCS (Edinburgh)",
    experience: 35,
    rating: 4.9, 
    reviews: 520, 
    location: "Max Super Speciality Hospital, Saket", 
    fee: 2200, 
    availability: "Tomorrow",
    about: "Chairman of Peripheral Vascular and Endovascular Sciences, specialized in diabetic foot management."
  }
];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState("All");
  const [maxFee, setMaxFee] = useState(3000);

  const filteredDoctors = useMemo(() => {
    return mockDoctors.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "All" || doc.specialty === selectedSpecialty;
      const matchesHospital = selectedHospital === "All" || doc.location === selectedHospital;
      const matchesFee = doc.fee <= maxFee;
      
      return matchesSearch && matchesSpecialty && matchesHospital && matchesFee;
    });
  }, [search, selectedSpecialty, selectedHospital, maxFee]);

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">Find a Specialist</h1>
          <p className="text-muted-foreground">Search and filter top doctors from Max Healthcare and Batra Hospital.</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search doctors by name or specialty..." 
                className="pl-10 bg-white border-none shadow-sm h-12 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger className="w-[200px] bg-white border-none shadow-sm rounded-xl h-12">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={maxFee.toString()} onValueChange={(v) => setMaxFee(parseInt(v))}>
                <SelectTrigger className="w-[150px] bg-white border-none shadow-sm rounded-xl h-12">
                  <SelectValue placeholder="Max Fee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">Up to ₹1000</SelectItem>
                  <SelectItem value="1500">Up to ₹1500</SelectItem>
                  <SelectItem value="2000">Up to ₹2000</SelectItem>
                  <SelectItem value="3000">Up to ₹3000</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="bg-white border-none shadow-sm rounded-xl h-12"
                onClick={() => {
                  setSearch("");
                  setSelectedSpecialty("All");
                  setSelectedHospital("All");
                  setMaxFee(3000);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {specialties.map((spec, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedSpecialty(spec.name)}
              className={`flex flex-col items-center gap-2 min-w-[120px] p-4 rounded-2xl shadow-sm transition-all border-2 ${
                selectedSpecialty === spec.name 
                ? "bg-primary border-primary text-white shadow-lg scale-105" 
                : "bg-white border-transparent hover:shadow-md text-foreground"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedSpecialty === spec.name ? "bg-white/20" : "bg-primary/10 text-primary"
              }`}>
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
                  <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden relative border shadow-inner">
                    <img 
                      src={`https://picsum.photos/seed/doc${doc.id}/200/200`} 
                      alt={doc.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{doc.name}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-[9px] uppercase font-bold whitespace-nowrap">
                        {doc.availability}
                      </Badge>
                    </div>
                    <p className="text-primary text-sm font-semibold">{doc.specialty}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-foreground">{doc.rating}</span>
                      <span>({doc.reviews} reviews)</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 leading-tight"><MapPin className="h-3 w-3 shrink-0" /> {doc.location}</span>
                      <span className="font-bold text-primary text-sm">₹{doc.fee} <span className="text-[10px] text-muted-foreground">/ consultation</span></span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-4 border-t border-muted flex justify-between gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-primary/5 border-primary/20 text-primary font-bold">
                      View Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-3xl">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{doc.name} - {doc.specialty}</DialogTitle>
                      <DialogDescription>Full medical profile and qualifications for {doc.name}</DialogDescription>
                    </DialogHeader>
                    <div className="bg-primary p-8 text-white relative">
                      <div className="flex gap-6 items-center">
                        <div className="w-24 h-24 rounded-3xl border-4 border-white/20 overflow-hidden shadow-2xl">
                          <img 
                            src={`https://picsum.photos/seed/doc${doc.id}/200/200`} 
                            alt={doc.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{doc.name}</h2>
                          <p className="text-white/80 font-medium">{doc.specialty}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                               <Star className="h-3 w-3 mr-1 fill-white" /> {doc.rating}
                             </Badge>
                             <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                               {doc.reviews} Reviews
                             </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> Qualifications
                          </p>
                          <p className="text-sm font-bold">{doc.degree}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                            <History className="h-3 w-3" /> Experience
                          </p>
                          <p className="text-sm font-bold">{doc.experience} Years</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                          <Award className="h-3 w-3" /> About Specialist
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                          "{doc.about}"
                        </p>
                      </div>

                      <div className="space-y-2">
                         <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Practice Location
                        </p>
                        <p className="text-sm font-medium">{doc.location}</p>
                      </div>

                      <div className="pt-4 border-t flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Consultation Fee</p>
                          <p className="text-2xl font-black text-primary">₹{doc.fee}</p>
                        </div>
                        <Button className="bg-primary px-8 h-12 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" className="flex-1 bg-primary text-white font-bold shadow-md hover:shadow-lg transition-all">
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-24 text-muted-foreground bg-white rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center opacity-20">
                <Search className="h-10 w-10" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">No specialists found</p>
                <p className="text-sm">Try adjusting your filters or search keywords.</p>
              </div>
              <Button variant="link" className="text-primary font-bold" onClick={() => {
                  setSearch("");
                  setSelectedSpecialty("All");
                  setSelectedHospital("All");
                  setMaxFee(3000);
                }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
