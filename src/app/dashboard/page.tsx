
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Ruler
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const healthRecordSchema = z.object({
  heartRate: z.coerce.number().min(30).max(250),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Format: 120/80"),
  bloodGlucose: z.coerce.number().min(20).max(600),
  weight: z.coerce.number().min(2).max(500),
  height: z.coerce.number().min(30).max(300),
});

type HealthRecordValues = z.infer<typeof healthRecordSchema>;

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "health_records"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, user?.uid]);

  const { data: records, isLoading } = useCollection(statsQuery);

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

  if (!mounted) return null;

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Health Dashboard</h1>
            <p className="text-muted-foreground tracking-tight">
              Welcome back, <span className="text-foreground font-bold">{user?.displayName || "Member"}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
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
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Log stats to see your activity trends.</div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm">Upcoming Appointments</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div><p className="text-sm font-bold">No Scheduled Visits</p><p className="text-xs">Book a doctor today</p></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm">Recent Medical Logs</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {records?.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-bold">Record Entry</p>
                        <p className="text-xs">{r.timestamp?.toDate ? new Date(r.timestamp.toDate()).toLocaleDateString() : 'Just now'}</p>
                      </div>
                    </div>
                  )) || <p className="text-xs text-muted-foreground">No recent logs.</p>}
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
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-destructive/10">
              <CardHeader><CardTitle className="text-destructive text-sm font-bold flex items-center gap-2"><ShieldAlert /> Health Alerts</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-destructive-foreground">
                  {latest && latest.heartRate > 100 
                    ? "Your heart rate is slightly elevated. Consider practicing deep breathing or consulting Dr. Smith." 
                    : "No critical health alerts detected at this time based on your logs."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
