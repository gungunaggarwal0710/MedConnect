
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Heart, 
  Droplets, 
  Activity, 
  TrendingUp,
  Clock,
  User,
  ShieldAlert,
  FileText,
  Plus,
  Loader2,
  Ruler,
  Calendar as CalendarIcon,
  MapPin,
  Stethoscope,
  Upload,
  Sparkles,
  CheckCircle2,
  Info,
  Save,
  ChevronRight,
  ClipboardList,
  Users,
  BriefcaseMedical,
  CalendarCheck,
  Star,
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, serverTimestamp, doc, where } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { readPrescription, type PrescriptionReaderOutput } from "@/ai/flows/prescription-reader-flow";

const healthRecordSchema = z.object({
  heartRate: z.coerce.number().min(30).max(250),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Format: 120/80"),
  bloodGlucose: z.coerce.number().min(20).max(600),
  weight: z.coerce.number().min(2).max(500),
  height: z.coerce.number().min(30).max(300),
});

type HealthRecordValues = z.infer<typeof healthRecordSchema>;

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
        <Navigation />
        <main className="max-w-md mx-auto px-4 mt-20 text-center">
          <Card className="border-none shadow-2xl p-8 rounded-3xl">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold mb-4">Login Required</CardTitle>
            <CardDescription className="text-base mb-8">
              To view your personalized health trends, appointments, and medical records, please log in to your account.
            </CardDescription>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-primary h-12 text-lg rounded-2xl shadow-xl">
                <Link href="/login">Login Now</Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 text-muted-foreground">
                <Link href="/register">Create an Account</Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      {profile?.role === "doctor" ? (
        <DoctorDashboard profile={profile} />
      ) : (
        <PatientDashboard profile={profile} />
      )}
    </div>
  );
}

function DoctorDashboard({ profile }: { profile: any }) {
  const { user } = useUser();
  const db = useFirestore();
  
  const doctorAppointmentsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid),
      orderBy("date", "asc")
    );
  }, [db, user?.uid]);

  const { data: appointments, isLoading: isAptLoading } = useCollection(doctorAppointmentsQuery);

  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments?.filter(apt => apt.date?.startsWith(today)) || [];
  const pendingApts = appointments?.filter(apt => apt.status === "scheduled") || [];

  return (
    <main className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Clinical Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, <span className="text-foreground font-bold">Dr. {profile?.name || user?.displayName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CalendarCheck className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary" className="text-[10px]">Today</Badge>
            </div>
            <div className="text-2xl font-bold">{todayApts.length}</div>
            <p className="text-xs text-muted-foreground">Appointments Today</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-[10px]">Active</Badge>
            </div>
            <div className="text-2xl font-bold">{new Set(appointments?.map(a => a.userId)).size}</div>
            <p className="text-xs text-muted-foreground">Unique Patients</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <Badge variant="secondary" className="text-[10px]">Queue</Badge>
            </div>
            <div className="text-2xl font-bold">{pendingApts.length}</div>
            <p className="text-xs text-muted-foreground">Pending Consultations</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <Badge variant="secondary" className="text-[10px]">Feedback</Badge>
            </div>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Patient Satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BriefcaseMedical className="h-5 w-5 text-primary" /> Upcoming Patient Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isAptLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : appointments && appointments.length > 0 ? (
              <div className="divide-y">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {apt.doctorName?.[0] || 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">Patient ID: {apt.userId?.substring(0, 8)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.time}</span>
                          <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {new Date(apt.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={apt.paymentMethod === 'prepaid' ? 'default' : 'outline'} className="text-[10px]">
                        {apt.paymentMethod === 'prepaid' ? 'Paid Online' : 'Pay at Spot'}
                      </Badge>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View Records
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No appointments scheduled yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary text-white border-none shadow-lg">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity /> Shift Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-[10px] uppercase font-bold opacity-80">Next Patient</p>
                <p className="text-lg font-bold">{pendingApts[0]?.time || 'No more today'}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-[10px] uppercase font-bold opacity-80">Avg. Consultation</p>
                <p className="text-lg font-bold">18 Mins</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Patient Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg text-xs">
                <p className="font-bold">New Booking</p>
                <p className="text-muted-foreground mt-1">A new patient has scheduled for next Tuesday.</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-xs">
                <p className="font-bold">Lab Results Ready</p>
                <p className="text-muted-foreground mt-1">Patient #82104's blood work is available for review.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function PatientDashboard({ profile }: { profile: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PrescriptionReaderOutput | null>(null);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const statsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "health_records"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, user?.uid]);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "appointments"),
      where("userId", "==", user.uid),
      orderBy("date", "asc")
    );
  }, [db, user?.uid]);

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "prescriptions"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [db, user?.uid]);

  const { data: records, isLoading: isStatsLoading } = useCollection(statsQuery);
  const { data: appointments, isLoading: isAppointmentsLoading } = useCollection(appointmentsQuery);
  const { data: prescriptions, isLoading: isPrescriptionsLoading } = useCollection(prescriptionsQuery);

  const form = useForm<HealthRecordValues>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      heartRate: 72,
      bloodPressure: "120/80",
      bloodGlucose: 90,
      weight: 70,
      height: 170,
    },
  });

  const latest = records?.[0];
  const chartData = [...(records || [])].reverse().map(r => ({
    day: r.timestamp?.toDate ? new Date(r.timestamp.toDate()).toLocaleDateString('en-US', { weekday: 'short' }) : '---',
    bpm: r.heartRate,
    glucose: r.bloodGlucose,
    weight: r.weight
  }));

  async function onSubmit(data: HealthRecordValues) {
    if (!db || !user?.uid) return;
    
    const colRef = collection(db, "users", user.uid, "health_records");
    addDocumentNonBlocking(colRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    
    toast({ title: "Stats Recorded", description: "Your health metrics have been updated." });
    setIsDialogOpen(false);
    form.reset();
  }

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzePrescription = async () => {
    if (!prescriptionImage) return;
    setIsAnalyzing(true);
    try {
      const result = await readPrescription({ photoDataUri: prescriptionImage });
      setAnalysisResult(result);
      toast({ title: "Analysis Successful", description: "Prescription details extracted." });
    } catch (error: any) {
      toast({ title: "Analysis Failed", description: error.message || "Could not read prescription", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSavePrescription = () => {
    if (!db || !user?.uid || !analysisResult) return;
    
    setIsSavingPrescription(true);
    const colRef = collection(db, "users", user.uid, "prescriptions");
    
    addDocumentNonBlocking(colRef, {
      ...analysisResult,
      createdAt: serverTimestamp(),
    });

    toast({ title: "Prescription Saved", description: "This prescription has been added to your medical records." });
    setIsSavingPrescription(false);
    setIsPrescriptionOpen(false);
    setAnalysisResult(null);
    setPrescriptionImage(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Health Dashboard</h1>
          <p className="text-muted-foreground tracking-tight">
            Welcome back, <span className="text-foreground font-bold">{profile?.name || user?.displayName || "Member"}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isPrescriptionOpen} onOpenChange={setIsPrescriptionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 shadow-sm">
                <FileText className="mr-2 h-4 w-4" /> AI Prescription Reader
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> AI Prescription Reader
                </DialogTitle>
                <DialogDescription>
                  Upload a photo of your prescription to extract medicines and instructions.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                {!analysisResult ? (
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => document.getElementById('presc-upload')?.click()}
                    >
                      {prescriptionImage ? (
                        <img src={prescriptionImage} alt="Prescription" className="max-h-60 rounded-lg shadow-md" />
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Click to upload prescription photo</p>
                          <p className="text-xs text-muted-foreground mt-1">Handwritten or printed images supported</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        id="presc-upload" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handlePrescriptionUpload} 
                      />
                    </div>
                    
                    {prescriptionImage && (
                      <Button 
                        onClick={handleAnalyzePrescription} 
                        disabled={isAnalyzing}
                        className="w-full bg-primary"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Extract Data
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Patient</p>
                        <p className="text-sm font-bold">{analysisResult.patientName || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Doctor</p>
                        <p className="text-sm font-bold">{analysisResult.doctorName || "N/A"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Prescribed Medications
                      </h3>
                      <div className="grid gap-3">
                        {analysisResult.medications.map((med, idx) => (
                          <div key={idx} className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-primary">{med.name}</p>
                              <Badge variant="outline" className="bg-white">{med.dosage}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Info className="h-3 w-3" /> {med.instructions}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analysisResult.diagnosis && (
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                        <p className="text-[10px] text-green-700 font-bold uppercase mb-1">Diagnosis Found</p>
                        <p className="text-sm font-bold text-green-900">{analysisResult.diagnosis}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setAnalysisResult(null)}>
                        Discard
                      </Button>
                      <Button 
                        className="flex-1 bg-primary" 
                        onClick={handleSavePrescription}
                        disabled={isSavingPrescription}
                      >
                        {isSavingPrescription ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Save to Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Log New Stats
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record Health Metrics</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="heartRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heart Rate (BPM)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bloodPressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BP (Systolic/Diastolic)</FormLabel>
                          <FormControl><Input placeholder="120/80" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="bloodGlucose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Glucose (mg/dL)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary mt-4">Save Entry</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-700">Live Health Sync</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Heart Rate", value: latest?.heartRate || "--", unit: "bpm", icon: Heart, color: "text-red-500" },
          { label: "Blood Pressure", value: latest?.bloodPressure || "--/--", unit: "mmHg", icon: Activity, color: "text-blue-500" },
          { label: "Blood Glucose", value: latest?.bloodGlucose || "--", unit: "mg/dL", icon: Droplets, color: "text-amber-500" },
          { label: "Weight", value: latest?.weight || "--", unit: "kg", icon: TrendingUp, color: "text-green-500" },
          { label: "Height", value: latest?.height || "--", unit: "cm", icon: Ruler, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Health Trends
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">Activity Insights</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isStatsLoading ? (
                <div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : chartData.length > 0 ? (
                <RefreshTrendChart data={chartData} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Log stats to see your activity trends.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" /> Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAppointmentsLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin h-4 w-4 text-primary" /></div>
                ) : appointments && appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg group">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{apt.doctorName}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {apt.time}</span>
                          <span className="flex items-center gap-1"><CalendarIcon className="h-2.5 w-2.5" /> {new Date(apt.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" /> {apt.hospitalName?.split(',')[0]}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[8px] bg-white whitespace-nowrap">{apt.status}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-bold">No Scheduled Visits</p>
                      <Button variant="link" className="text-xs p-0 h-auto font-bold" asChild>
                        <Link href="/doctors">Book a doctor today</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-sm">Medical Records & Prescriptions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {isPrescriptionsLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin h-4 w-4 text-primary" /></div>
                ) : prescriptions && prescriptions.length > 0 ? (
                  prescriptions.map((presc) => (
                    <div 
                      key={presc.id} 
                      className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors group"
                      onClick={() => setViewingPrescription(presc)}
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary">Rx: {presc.doctorName || "Doctor"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {presc.createdAt?.toDate ? new Date(presc.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[8px]">{presc.medications?.length} items</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                ) : null}
                
                {records?.slice(0, 3).map((r, i) => (
                  <div key={`rec-${i}`} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-bold">Vital Signs Log</p>
                      <p className="text-xs">{r.timestamp?.toDate ? new Date(r.timestamp.toDate()).toLocaleDateString() : 'Just now'}</p>
                    </div>
                  </div>
                ))}
                
                {(!records || records.length === 0) && (!prescriptions || prescriptions.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">No recent logs found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-white border-none shadow-lg">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock /> Reminders</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 p-3 rounded-lg text-sm font-medium">Log your daily weight</div>
              <div className="bg-white/10 p-3 rounded-lg text-sm font-medium">Check glucose level (After meal)</div>
              {prescriptions && prescriptions.length > 0 && (
                <div className="bg-white/20 p-3 rounded-lg text-xs italic">
                  You have active medications from your latest prescription.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-destructive/10">
            <CardHeader><CardTitle className="text-destructive text-sm font-bold flex items-center gap-2"><ShieldAlert /> Health Alerts</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-destructive-foreground">
                {latest && latest.heartRate > 100 
                  ? "Your heart rate is slightly elevated. Consider practicing deep breathing or consulting a specialist." 
                  : "No critical health alerts detected at this time based on your logs."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!viewingPrescription} onOpenChange={(open) => !open && setViewingPrescription(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <ClipboardList className="h-5 w-5" /> Prescription Review
            </DialogTitle>
            <DialogDescription>
              Detailed records for prescription added on {viewingPrescription?.createdAt?.toDate ? new Date(viewingPrescription.createdAt.toDate()).toLocaleDateString() : 'recent date'}.
            </DialogDescription>
          </DialogHeader>

          {viewingPrescription && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Prescribing Doctor</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" /> {viewingPrescription.doctorName || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Patient Name</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> {viewingPrescription.patientName || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> Medications & Dosage
                </h3>
                <div className="grid gap-3">
                  {viewingPrescription.medications?.map((med: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white border border-border rounded-2xl shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-primary">{med.name}</p>
                        <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px]">{med.dosage}</Badge>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        <p>{med.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingPrescription.diagnosis && (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-1">Stated Diagnosis</p>
                  <p className="text-sm font-bold text-green-900">{viewingPrescription.diagnosis}</p>
                </div>
              )}

              {viewingPrescription.additionalNotes && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mb-1">Additional Notes</p>
                  <p className="text-xs text-amber-900 italic leading-relaxed">
                    "{viewingPrescription.additionalNotes}"
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" onClick={() => setViewingPrescription(null)}>
                  Close Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function RefreshTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" />
        <YAxis hide />
        <Tooltip />
        <Area type="monotone" dataKey="bpm" stroke="hsl(var(--primary))" fill="url(#colorSteps)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
