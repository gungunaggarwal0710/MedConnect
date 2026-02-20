"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Phone, Send, MapPin, Hospital, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyPage() {
  const { toast } = useToast();
  const [sosSent, setSosSent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Simulate getting geo-location
    setTimeout(() => {
      setLocation({ lat: 28.6139, lng: 77.2090 });
    }, 1500);
  }, []);

  const handleSOS = () => {
    setSosSent(true);
    toast({
      title: "SOS ALERT SENT",
      description: "Alerted your emergency contacts and nearest hospitals.",
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
              <span className="text-xs mt-2 uppercase tracking-widest font-bold">Hold to trigger</span>
            </button>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-green-600 flex items-center justify-center gap-2 text-xl font-bold">
                <Send className="h-6 w-6" /> Alert Active
              </div>
              <p className="text-sm bg-green-50 text-green-700 p-4 rounded-lg">
                Your location (28.6139° N, 77.2090° E) has been shared with Apollo Hospital & Emergency Contacts.
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
              { name: "Apollo Multispecialty", dist: "0.8 km", beds: 4, type: "Hospital", phone: "+123456789" },
              { name: "Fortis ER Center", dist: "1.2 km", beds: 2, type: "Clinic", phone: "+987654321" },
            ].map((hosp, i) => (
              <Card key={i} className="hover:border-primary transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <h3 className="font-bold">{hosp.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {hosp.dist}
                      <Activity className="h-3 w-3 ml-2" /> {hosp.beds} ICU beds free
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="rounded-full">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-primary text-white">Navigate</Button>
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
              <div className="flex gap-4 overflow-x-auto pb-2">
                {["Sarah (Wife)", "Dad", "Dr. Miller"].map((contact, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[80px]">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border text-sm font-bold">
                      {contact[0]}
                    </div>
                    <span className="text-[10px] text-center font-medium">{contact}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}