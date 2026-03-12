
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
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
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

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EmergencyPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [sosSent, setSosSent] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
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

  // Query for donors
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

  const { data: donors, isLoading: isDonorsLoading } = useCollection(donorsQuery);

  useEffect(() => {
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

  const handleSOS = () => {
    setSosSent(true);
    toast({
      title: "SOS ALERT SENT",
      description: `Alerted ${profile?.emergencyContacts?.length || 0} emergency contacts and nearest hospitals.`,
      variant: "destructive",
    });
  };

  const handleRegisterDonor = () => {
    if (!db || !user?.uid) return;
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

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4">
        <div className="text-center space-y-4 mb-8">
          <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-destructive">Emergency SOS</h1>
          <p className="text-muted-foreground">Tap the button below for immediate assistance.</p>
        </div>

        <div className="flex justify-center mb-12">
          {!sosSent ? (
            <button 
              onClick={handleSOS}
              className="w-48 h-48 rounded-full bg-destructive shadow-[0_0_50px_rgba(255,107,107,0.5)] flex flex-col items-center justify-center text-white border-8 border-white animate-bounce active:scale-95 transition-transform"
            >
              <span className="text-4xl font-black">SOS</span>
              <span className="text-xs mt-2 uppercase tracking-widest font-bold">Tap to trigger</span>
            </button>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-green-600 flex items-center justify-center gap-2 text-xl font-bold">
                <Send className="h-6 w-6" /> Alert Active
              </div>
              <p className="text-sm bg-green-50 text-green-700 p-4 rounded-lg">
                Your location {location ? `(${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E)` : '(fetching...)'} has been shared with nearby hospitals & Emergency Contacts.
              </p>
            </div>
          )}
        </div>

        {/* Emergency Blood Section */}
        <section className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-600" /> Emergency Blood Support
            </h2>
            <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50">
                  <PlusCircle className="h-4 w-4 mr-2" /> Register as Donor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Blood Donor Registration</DialogTitle>
                  <DialogDescription>Your details will be visible to people in medical emergencies.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="Enter your name" 
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
                      <Label>Contact Number</Label>
                      <Input 
                        placeholder="10 digit number" 
                        value={donorData.phone} 
                        onChange={e => setDonorData({...donorData, phone: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>General Location</Label>
                    <Input 
                      placeholder="e.g. Saket, Delhi" 
                      value={donorData.location} 
                      onChange={e => setDonorData({...donorData, location: e.target.value})} 
                    />
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleRegisterDonor}>
                    Confirm Volunteer Registration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-red-50/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Find Nearby Donors</CardTitle>
                <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Groups</SelectItem>
                    {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isDonorsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>
              ) : donors && donors.length > 0 ? (
                <div className="space-y-3">
                  {donors.map((donor) => (
                    <div key={donor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-red-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                          {donor.bloodType}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{donor.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" /> {donor.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">Available</Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" asChild>
                          <a href={`tel:${donor.phone}`}><Phone className="h-4 w-4" /></a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Droplets className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground">No donors found for this blood group.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Hospital className="h-5 w-5 text-primary" /> Nearest Assistance
          </h2>
          
          <div className="grid gap-4">
            {[
              { name: "Max Super Speciality", dist: "0.8 km", beds: 24, type: "Hospital", phone: "+911126515050" },
              { name: "Indraprastha Apollo", dist: "3.2 km", beds: 40, type: "Hospital", phone: "+911171791090" },
            ].map((hosp, i) => (
              <Card key={i} className="hover:border-primary transition-colors border-none shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <h3 className="font-bold">{hosp.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {hosp.dist}
                      <Activity className="h-3 w-3 ml-2 text-primary" /> {hosp.beds} ICU beds free
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="rounded-full" asChild>
                      <a href={`tel:${hosp.phone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" className="bg-primary text-white" asChild>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.name)}`} target="_blank">Navigate</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <Card className="bg-secondary/50 border-none">
            <CardHeader>
              <CardTitle className="text-sm">Emergency Contacts Alerted</CardTitle>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin h-6 w-6 text-primary" />
                </div>
              ) : profile?.emergencyContacts?.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {profile.emergencyContacts.map((contact: any, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-1 min-w-[100px]">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-primary/20 text-sm font-bold text-primary">
                        {contact.name[0]}
                      </div>
                      <span className="text-[10px] text-center font-bold truncate w-full px-1">{contact.name}</span>
                      <span className="text-[9px] text-center text-muted-foreground">{contact.relation || "Contact"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No emergency contacts found. Add them in your <a href="/profile" className="text-primary font-bold underline">Profile</a>.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
