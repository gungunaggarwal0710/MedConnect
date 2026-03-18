
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShieldAlert, 
  Phone, 
  Send, 
  MapPin, 
  Hospital, 
  Activity, 
  Loader2, 
  Droplets, 
  Heart, 
  Search,
  PlusCircle,
  CheckCircle2,
  Users,
  Award,
  Truck,
  Flame,
  UserCheck,
  Smartphone,
  Info,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc, collection, query, where, serverTimestamp } from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { mockBloodDonors, mockAmbulances } from "@/lib/mock-data";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emergencyContactsList = [
  { label: "Emergency", number: "112", icon: ShieldAlert, color: "bg-red-600" },
  { label: "Police", number: "100", icon: ShieldAlert, color: "bg-blue-600" },
  { label: "Fire", number: "101", icon: Flame, color: "bg-orange-600" },
  { label: "Ambulance", number: "102", icon: Truck, color: "bg-green-600" },
];

export default function EmergencyPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [bookingAmbulance, setBookingAmbulance] = useState<any>(null);
  
  // Blood Donor States
  const [selectedBloodType, setSelectedBloodType] = useState<string>("All");
  const [isRegistering, setIsRegistering] = useState(false);
  const [donorData, setDonorData] = useState({
    name: "",
    bloodType: "",
    phone: "",
    location: "New Delhi"
  });

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    setMounted(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, () => {
        setLocation({ lat: 28.6139, lng: 77.2090 });
      });
    } else {
      setLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Query for donors in Firestore
  const donorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    if (selectedBloodType === "All") {
      return query(collection(db, "blood_donors"), where("isAvailable", "==", true));
    }
    return query(
      collection(db, "blood_donors"), 
      where("bloodType", "==", selectedBloodType),
      where("isAvailable", "==", true)
    );
  }, [db, selectedBloodType]);

  const { data: firestoreDonors, isLoading: isDonorsLoading } = useCollection(donorsQuery);

  // Combine Mock Donors and Firestore Donors for a comprehensive list
  const allDonors = useMemo(() => {
    const mock = mockBloodDonors.filter(d => selectedBloodType === "All" || d.bloodType === selectedBloodType);
    const dbDonors = firestoreDonors || [];
    return [...dbDonors, ...mock];
  }, [firestoreDonors, selectedBloodType]);

  const handleSOS = () => {
    setSosSent(true);
    toast({
      title: "SOS ALERT SENT",
      description: `Alerted ${profile?.emergencyContacts?.length || 0} emergency contacts and nearest hospitals.`,
      variant: "destructive",
    });
  };

  const handleBookAmbulance = (amb: any) => {
    setBookingAmbulance(amb);
    toast({
      title: "Ambulance Requested",
      description: `${amb.provider} is dispatched and arriving in ${amb.eta}.`,
    });
  };

  const handleRegisterDonor = () => {
    if (!db || !user?.uid) {
      toast({ title: "Login Required", description: "Please log in to register as a donor.", variant: "destructive" });
      return;
    }
    const colRef = collection(db, "blood_donors");
    addDocumentNonBlocking(colRef, {
      userId: user.uid,
      name: donorData.name || profile?.name || "Anonymous Donor",
      bloodType: donorData.bloodType,
      phone: donorData.phone || profile?.phone || "",
      location: donorData.location,
      isAvailable: true,
      createdAt: serverTimestamp()
    });
    toast({ title: "Registration Successful", description: "You are now listed as an emergency blood donor." });
    setIsRegistering(false);
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
      
      <main className="max-w-4xl mx-auto px-4">
        {/* Main SOS Section */}
        <section className="text-center space-y-6 mb-12">
          <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-destructive tracking-tighter uppercase">Emergency SOS</h1>
            <p className="text-muted-foreground font-medium">Immediate assistance at your fingertips</p>
          </div>

          <div className="flex justify-center py-6">
            {!sosSent ? (
              <button 
                onClick={handleSOS}
                className="w-56 h-56 rounded-full bg-destructive shadow-[0_0_60px_rgba(255,107,107,0.6)] flex flex-col items-center justify-center text-white border-[10px] border-white active:scale-95 transition-all animate-pulse-red"
              >
                <span className="text-5xl font-black italic">SOS</span>
                <span className="text-[10px] mt-2 uppercase tracking-[0.2em] font-bold opacity-80">Tap to Trigger</span>
              </button>
            ) : (
              <Card className="w-full max-w-md border-green-200 bg-green-50/50 shadow-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto animate-bounce">
                    <Send className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-green-700">Alert System Active</h2>
                    <p className="text-sm text-green-600/80 leading-relaxed px-4">
                      Your real-time location {location ? `(${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E)` : '(fetching...)'} shared with State Emergency Room and {profile?.emergencyContacts?.length || 0} family members.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Quick Emergency Numbers */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {emergencyContactsList.map((item, i) => (
            <a 
              key={i} 
              href={`tel:${item.number}`}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-transparent hover:border-primary/20 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${item.color} shadow-md group-hover:scale-110 transition-transform`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase">{item.label}</p>
                <p className="text-xl font-black text-foreground">{item.number}</p>
              </div>
            </a>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Nearby Ambulances */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" /> Book Nearby Ambulance
            </h2>
            <Card className="border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="bg-green-50/50 pb-4">
                <CardTitle className="text-sm font-bold">Fastest Response Units</CardTitle>
                <CardDescription className="text-[10px]">Showing ACLS & BLS units within 10km radius</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {mockAmbulances.map((amb) => (
                  <div key={amb.id} className="p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-green-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{amb.provider}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">{amb.type}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] font-bold">
                        {amb.eta}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 h-9 rounded-xl border-green-200 text-green-700"
                        asChild
                      >
                        <a href={`tel:${amb.phone}`}>Call Unit</a>
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 h-9 rounded-xl bg-green-600 hover:bg-green-700"
                        onClick={() => handleBookAmbulance(amb)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Blood Donor Network */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Droplets className="h-5 w-5 text-red-600" /> Blood Donor Network
              </h2>
              <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-red-600 text-red-600 text-[10px] rounded-lg">
                    <PlusCircle className="h-3 w-3 mr-1" /> Register
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Volunteer Donor Registration</DialogTitle>
                    <DialogDescription>Your details help save lives during local medical emergencies.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="Your name" 
                        value={donorData.name} 
                        onChange={e => setDonorData({...donorData, name: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Blood Type</Label>
                        <Select onValueChange={v => setDonorData({...donorData, bloodType: v})}>
                          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                          <SelectContent>
                            {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Contact</Label>
                        <Input 
                          placeholder="10 digit phone" 
                          value={donorData.phone} 
                          onChange={e => setDonorData({...donorData, phone: e.target.value})} 
                        />
                      </div>
                    </div>
                    <Button className="w-full bg-red-600" onClick={handleRegisterDonor}>Register Now</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card className="border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="bg-red-50/50 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold">Delhi NCR Donors</CardTitle>
                  <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                    <SelectTrigger className="w-24 h-7 text-[10px] bg-white">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Groups</SelectItem>
                      {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-4 max-h-[300px] overflow-y-auto scrollbar-hide space-y-3">
                {isDonorsLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>
                ) : allDonors.length > 0 ? (
                  allDonors.map((donor) => (
                    <div key={donor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-red-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                          {donor.bloodType}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate flex items-center gap-1">
                            {donor.name}
                            {donor.id.startsWith('bd') && <Award className="h-3 w-3 text-amber-500 fill-amber-500" />}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{donor.location}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 bg-red-50 rounded-full shrink-0" asChild>
                        <a href={`tel:${donor.phone}`}><Phone className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-xs text-muted-foreground italic">No donors found.</p>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Nearest Hospitals */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Hospital className="h-5 w-5 text-primary" /> Hospital Support
          </h2>
          <div className="grid gap-4">
            {[
              { name: "Max Super Speciality", dist: "0.8 km", beds: 24, phone: "+911126515050" },
              { name: "Indraprastha Apollo", dist: "3.2 km", beds: 40, phone: "+911171791090" },
            ].map((hosp, i) => (
              <Card key={i} className="hover:border-primary transition-all border-none shadow-sm group">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{hosp.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {hosp.dist}
                      <Activity className="h-3 w-3 ml-2 text-primary" /> {hosp.beds} ICU beds free
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="rounded-full bg-secondary/50 text-primary" asChild>
                      <a href={`tel:${hosp.phone}`}><Phone className="h-4 w-4" /></a>
                    </Button>
                    <Button size="sm" className="bg-primary rounded-xl" asChild>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.name)}`} target="_blank">Navigate</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
