
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
import { cn } from "@/lib/utils";

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
  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Health Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, John Doe</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-700">Profile: 92% Complete</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Heart Rate", value: "72", unit: "bpm", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
            { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Blood Glucose", value: "95", unit: "mg/dL", icon: Droplets, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Weight", value: "74.5", unit: "kg", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
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
          {/* Charts Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Activity Trends
                </CardTitle>
                <CardDescription>Daily step count over the last week</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData}>
                    <defs>
                      <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    />
                    <Area type="monotone" dataKey="steps" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSteps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { doctor: "Dr. Emily Smith", dept: "Cardiologist", time: "Tomorrow, 10:00 AM" },
                    { doctor: "Dr. Mark Wilson", dept: "General Physician", time: "Friday, 02:30 PM" },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{apt.doctor}</p>
                        <p className="text-[10px] text-muted-foreground">{apt.dept} • {apt.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Recent Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Annual Physical Exam", date: "Jan 12, 2024", type: "PDF" },
                    { title: "Blood Test Results", date: "Dec 05, 2023", type: "PDF" },
                  ].map((rec, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-bold">{rec.title}</p>
                          <p className="text-[10px] text-muted-foreground">{rec.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{rec.type}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Side Column - Live Alerts */}
          <div className="space-y-6">
            <Card className="bg-primary text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Medication Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/10 p-3 rounded-lg flex items-center gap-3">
                  <Badge className="bg-white text-primary">08:00 AM</Badge>
                  <span className="text-sm font-medium">Multivitamin (1 Tablet)</span>
                </div>
                <div className="bg-white/10 p-3 rounded-lg flex items-center gap-3">
                  <Badge className="bg-white text-primary">09:30 PM</Badge>
                  <span className="text-sm font-medium">Melatonin (5mg)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-destructive/10">
              <CardHeader>
                <CardTitle className="text-destructive text-sm font-bold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Emergency Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-destructive-foreground">
                  Your current stress levels and activity suggest a slightly elevated heart health risk. Consider a short walk.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
