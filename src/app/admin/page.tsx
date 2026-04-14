
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Loader2, 
  Bell, 
  Filter,
  Activity,
  ArrowRight,
  ExternalLink,
  Search
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, where, limit } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

  // Profile check for admin role
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Real-time Emergency Requests
  const emergencyQuery = useMemoFirebase(() => {
    if (!db) return null;
    const baseQuery = collection(db, "emergency_requests");
    if (filter === "all") return query(baseQuery, orderBy("timestamp", "desc"), limit(50));
    return query(baseQuery, where("status", "==", filter), orderBy("timestamp", "desc"), limit(50));
  }, [db, filter]);

  const { data: requests, isLoading: isRequestsLoading } = useCollection(emergencyQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sound alert for new pending requests
  useEffect(() => {
    if (requests && requests.length > 0) {
      const latestPending = requests.find(r => r.status === "pending");
      if (latestPending && latestPending.id !== lastNotifiedId) {
        setLastNotifiedId(latestPending.id);
        // Play notification sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(e => console.log("Audio play blocked by browser policy", e));
        
        toast({
          title: "NEW EMERGENCY ALERT",
          description: `${latestPending.type} requested by ${latestPending.userName || "Anonymous"}`,
          variant: "destructive"
        });
      }
    }
  }, [requests, lastNotifiedId, toast]);

  const handleResolve = (requestId: string) => {
    if (!db) return;
    const docRef = doc(db, "emergency_requests", requestId);
    updateDocumentNonBlocking(docRef, { status: "resolved" });
    toast({ title: "Request Resolved", description: "The emergency has been marked as resolved." });
  };

  if (!mounted || isUserLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Basic role check - redirect or show error if not admin
  if (!user || profile?.role !== "admin") {
    return (
      <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Navigation />
        <Card className="max-w-md w-full border-none shadow-2xl text-center p-8 rounded-3xl">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 text-destructive">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold mb-4">Access Denied</CardTitle>
          <CardDescription className="text-base mb-8">
            This dashboard is reserved for authorized emergency dispatch personnel and medical administrators only.
          </CardDescription>
          <Button asChild className="w-full h-12 rounded-2xl">
            <Link href="/">Back to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-slate-50/50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-destructive flex items-center justify-center rounded-2xl shadow-lg shadow-destructive/20 text-white animate-pulse">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Emergency Dispatch</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-green-600 font-bold">
                  <Activity className="h-3 w-3" /> Live Control Room
                </span>
                <span>•</span>
                <span>Monitoring {requests?.length || 0} active logs</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border shadow-sm">
            <Button 
              variant={filter === "all" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-xl font-bold"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-xl font-bold"
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button 
              variant={filter === "resolved" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-xl font-bold"
              onClick={() => setFilter("resolved")}
            >
              Resolved
            </Button>
          </div>
        </div>

        {isRequestsLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Connecting to Emergency Stream...</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card 
                key={req.id} 
                className={cn(
                  "border-2 transition-all duration-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-md",
                  req.status === "pending" 
                    ? "border-destructive/30 bg-white ring-4 ring-destructive/5 animate-in fade-in zoom-in-95" 
                    : "border-transparent bg-slate-50 opacity-80"
                )}
              >
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant={req.status === "pending" ? "destructive" : "secondary"}
                      className={cn(
                        "uppercase text-[10px] font-black tracking-widest px-3 py-1 rounded-full",
                        req.status === "pending" && "animate-pulse"
                      )}
                    >
                      {req.status}
                    </Badge>
                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {req.timestamp?.toDate ? new Date(req.timestamp.toDate()).toLocaleTimeString() : "Just now"}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-800 leading-tight">
                    {req.type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Reporter</p>
                      <p className="font-bold text-slate-900 truncate">{req.userName || "Anonymous"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Location Data</p>
                      <p className="font-bold text-slate-900 truncate">
                        {req.latitude?.toFixed(4)}° N, {req.longitude?.toFixed(4)}° E
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                      <a 
                        href={`https://www.google.com/maps?q=${req.latitude},${req.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-4 border-t border-slate-100">
                  {req.status === "pending" ? (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-2xl shadow-lg shadow-primary/20"
                      onClick={() => handleResolve(req.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Resolved
                    </Button>
                  ) : (
                    <div className="w-full text-center py-2 text-green-600 font-bold text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Case Closed
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border-2 border-dashed p-20 text-center space-y-4 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <ShieldAlert className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">No Active Emergency Requests</h2>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm mt-2">
                System is operational. All incoming SOS alerts will appear here in real-time.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Quick stats footer for Admin */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border shadow-2xl z-50 flex items-center gap-6 md:bottom-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">System Live</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Pending:</span>
          <span className="text-xs font-black text-destructive">{requests?.filter(r => r.status === "pending").length || 0}</span>
        </div>
      </div>
    </div>
  );
}

