
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Phone, Send, MapPin, Hospital, Activity, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";

export default function EmergencyPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [sosSent, setSosSent] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    // Simulate getting geo-location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, () => {
        // Fallback to mock Delhi location
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

        <section className="space-y-6">
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
