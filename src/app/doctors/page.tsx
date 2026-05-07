
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Stethoscope,
  Heart,
  Baby,
  Brain,
  Eye,
  User,
  GraduationCap,
  History,
  Award,
  Activity,
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  Wallet,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockDoctors, specialties, hospitals } from "@/lib/mock-data";
import { useUser, useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";

const iconMap: Record<string, any> = {
  Stethoscope,
  Heart,
  Baby,
  Brain,
  Eye,
  User,
  Activity,
};

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", 
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

export default function DoctorsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState("All");
  const [maxFee, setMaxFee] = useState(3000);

  // Booking states
  const [bookingDoctor, setBookingDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("spot");
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [bookingRefId, setBookingRefId] = useState("");

  useEffect(() => {
    setMounted(true);
    setBookingDate(new Date());
  }, []);

  useEffect(() => {
    if (isBookingSuccess && !bookingRefId) {
      setBookingRefId(`MC-${Math.floor(Math.random() * 900000) + 100000}`);
    }
  }, [isBookingSuccess, bookingRefId]);

  const filteredDoctors = useMemo(() => {
    return mockDoctors.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "All" || doc.specialty === selectedSpecialty;
      const matchesHospital = selectedHospital === "All" || doc.location.includes(selectedHospital);
      const matchesFee = doc.fee <= maxFee;
      
      return matchesSearch && matchesSpecialty && matchesHospital && matchesFee;
    });
  }, [search, selectedSpecialty, selectedHospital, maxFee]);

  const handleConfirmBooking = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to book an appointment.", variant: "destructive" });
      router.push("/login");
      return;
    }

    if (!selectedTime) {
      toast({ title: "Select Time", description: "Please choose a time slot.", variant: "destructive" });
      return;
    }

    if (!bookingDate) {
      toast({ title: "Select Date", description: "Please choose a date.", variant: "destructive" });
      return;
    }
    
    if (db && user.uid && bookingDoctor) {
      const appointmentsRef = collection(db, "appointments");
      addDocumentNonBlocking(appointmentsRef, {
        userId: user.uid,
        doctorId: bookingDoctor.id,
        doctorName: bookingDoctor.name,
        specialty: bookingDoctor.specialty,
        hospitalName: bookingDoctor.location,
        date: bookingDate.toISOString(),
        time: selectedTime,
        paymentMethod: paymentMethod,
        status: "scheduled",
        createdAt: serverTimestamp()
      });

      setIsBookingSuccess(true);
      toast({ 
        title: "Booking Confirmed!", 
        description: `Appointment with ${bookingDoctor.name} on ${bookingDate.toLocaleDateString()} at ${selectedTime}.` 
      });
    }
  };

  const resetBooking = () => {
    setBookingDoctor(null);
    setBookingDate(new Date());
    setSelectedTime("");
    setPaymentMethod("spot");
    setIsBookingSuccess(false);
    setBookingRefId("");
  };

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
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">Find a Specialist</h1>
          <p className="text-muted-foreground">Search and filter top doctors from our hospital network.</p>
          
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
            <div className="flex flex-wrap gap-2">
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger className="w-[200px] bg-white border-none shadow-sm rounded-xl h-12">
                  <SelectValue placeholder="Hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Hospitals</SelectItem>
                  {hospitals.map(h => (
                    <SelectItem key={h.id} value={h.name}>{h.name}</SelectItem>
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
          {specialties.map((spec, i) => {
            const Icon = iconMap[spec.icon] || Stethoscope;
            return (
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
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-center">{spec.name}</span>
              </button>
            );
          })}
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
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">{doc.name}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-[9px] uppercase font-bold whitespace-nowrap ml-2">
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
                      <span className="font-bold text-primary text-sm">₹{doc.fee} <span className="text-[10px] text-muted-foreground">/ session</span></span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-4 border-t border-muted flex justify-between gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-primary/5 border-primary/20 text-primary font-bold">
                      Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-3xl">
                    <DialogHeader className="p-8 pb-0">
                      <DialogTitle className="text-2xl font-bold">{doc.name}</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        {doc.specialty} Specialist • {doc.degree}
                      </DialogDescription>
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
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                            Qualifications
                          </p>
                          <p className="text-sm font-bold">{doc.degree}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                            Experience
                          </p>
                          <p className="text-sm font-bold">{doc.experience} Years</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{doc.about}"
                      </p>
                      <div className="pt-4 border-t flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Fee</p>
                          <p className="text-2xl font-black text-primary">₹{doc.fee}</p>
                        </div>
                        <Button 
                          className="bg-primary px-8 h-12 text-lg rounded-2xl"
                          onClick={() => setBookingDoctor(doc)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  size="sm" 
                  className="flex-1 bg-primary text-white font-bold"
                  onClick={() => setBookingDoctor(doc)}
                >
                  Book Slot
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Global Booking Dialog - Moved outside loop to prevent flickering */}
      <Dialog open={!!bookingDoctor} onOpenChange={(open) => !open && resetBooking()}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-3xl max-h-[90vh] overflow-y-auto">
          {!isBookingSuccess ? (
            <div className="space-y-0">
              <div className="p-6 bg-primary text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">Schedule Appointment</DialogTitle>
                  <DialogDescription className="text-white/80">
                    Consultation with {bookingDoctor?.name}
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" /> Select Date
                  </Label>
                  <div className="border rounded-2xl p-2 bg-muted/5">
                    <Calendar
                      mode="single"
                      selected={bookingDate}
                      onSelect={setBookingDate}
                      className="rounded-md mx-auto"
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const twoWeeksOut = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                        return date < today || date > twoWeeksOut;
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Available Slots
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all ${
                          selectedTime === time 
                            ? "bg-primary border-primary text-white shadow-md" 
                            : "bg-white border-muted hover:border-primary/30"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" /> Payment
                  </Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="prepaid" id="prepaid" className="peer sr-only" />
                      <Label
                        htmlFor="prepaid"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-muted/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <Wallet className="mb-2 h-6 w-6 text-primary" />
                        <span className="text-xs font-bold">Online</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="spot" id="spot" className="peer sr-only" />
                      <Label
                        htmlFor="spot"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-muted/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <CreditCard className="mb-2 h-6 w-6 text-primary" />
                        <span className="text-xs font-bold">At Hospital</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Fee</p>
                    <p className="text-2xl font-black text-primary">₹{bookingDoctor?.fee}</p>
                  </div>
                  <Button 
                    className="bg-primary px-8 h-12 text-lg rounded-2xl"
                    onClick={handleConfirmBooking}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-6 bg-white flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground">Success!</h2>
                <p className="text-muted-foreground">
                  Confirmed for {bookingDate?.toLocaleDateString()} at {selectedTime}.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl w-full text-left">
                <p className="text-sm font-bold">Ref: {bookingRefId}</p>
              </div>
              <Button className="w-full bg-primary h-12 rounded-2xl" onClick={resetBooking}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
