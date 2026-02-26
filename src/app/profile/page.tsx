
"use client";

import { Navigation } from "@/components/Navigation";
import { useUser, useFirestore, useAuth } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Phone, Mail, Calendar, ShieldCheck, Stethoscope, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
        <Navigation />
        <main className="max-w-2xl mx-auto px-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="space-y-4">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <div className="space-y-2 text-center">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background flex items-center justify-center">
        <Navigation />
        <Card className="max-w-md w-full mx-4 border-none shadow-lg text-center p-8">
          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Not Logged In</CardTitle>
          <CardDescription className="mb-6">Please log in to view and manage your profile.</CardDescription>
          <Button onClick={() => router.push("/login")} className="w-full bg-primary">Go to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4">
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="h-32 bg-primary/10 w-full" />
          <CardHeader className="text-center -mt-16 pb-8">
            <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-xl">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                {profile?.name?.[0] || user.email?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 space-y-1">
              <CardTitle className="text-2xl font-bold">{profile?.name || "Member"}</CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
                  {profile?.role || "User"}
                </Badge>
                {profile?.role === "doctor" && (
                  <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Email Address</p>
                  <p className="font-bold">{user.email || profile?.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Phone Number</p>
                  <p className="font-bold">{profile?.phone || user.phoneNumber || "Not provided"}</p>
                </div>
              </div>

              {profile?.role === "patient" && (
                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">Age</p>
                    <p className="font-bold">{profile?.age} years</p>
                  </div>
                </div>
              )}

              {profile?.role === "doctor" && (
                <>
                  <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Specialty</p>
                      <p className="font-bold">{profile?.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">License Number</p>
                      <p className="font-bold">{profile?.licenseNumber}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-4 flex flex-col gap-4">
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 border-destructive/20" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Account created on {profile?.createdAt?.toDate?.() ? profile.createdAt.toDate().toLocaleDateString() : 'recently'}
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
