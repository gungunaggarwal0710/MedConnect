"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
  User,
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase";
import { useEffect, useState } from "react";

const healthData = [
  { day: 'Mon', bpm: 72, steps: 4000 },
  { day: 'Tue', bpm: 75, steps: 6000 },
  { day: 'Wed', bpm: 70, steps: 8500 },
  { day: 'Thu', bpm: 68, steps: 5000 },
  { day: 'Fri', bpm: 74, steps: 9200 },
  { day: 'Sat', bpm: 71, steps: 11000 },
  { day: 'Sun', bpm: 73, steps: 7500 },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Health Dashboard</h1>
            <p className="text-muted-foreground tracking-tight">
              Welcome back, <span className="text-foreground font-bold">{user?.displayName || "Member"}</span>
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-700">Profile: 92% Complete</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Heart Rate", value: "72", unit: "bpm", icon: Heart, color: "text-red-500" },
            { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Activity, color: "text-blue-500" },
            { label: "Blood Glucose", value: "95", unit: "mg/dL", icon: Droplets, color: "text-amber-500" },
            { label: "Weight", value: "74.5", unit: "kg", icon: TrendingUp, color: "text-green-500" },
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
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData}>
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
                    <Area type="monotone" dataKey="steps" stroke="hsl(var(--primary))" fill="url(#colorSteps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm">Upcoming Appointments</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div><p className="text-sm font-bold">Dr. Emily Smith</p><p className="text-xs">Tomorrow, 10:00 AM</p></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm">Recent Records</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-sm font-bold">Physical Exam</p><p className="text-xs">Jan 12, 2024</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary text-white border-none shadow-lg">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock /> Reminders</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/10 p-3 rounded-lg text-sm font-medium">Multivitamin (08:00 AM)</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-destructive/10">
              <CardHeader><CardTitle className="text-destructive text-sm font-bold flex items-center gap-2"><ShieldAlert /> Risks</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-destructive-foreground">Elevated heart health risk detected based on activity.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
