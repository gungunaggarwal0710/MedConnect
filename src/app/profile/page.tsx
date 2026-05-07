
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useUser, useFirestore, useAuth, useMemoFirebase } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Stethoscope, 
  BadgeCheck, 
  Plus, 
  Trash2, 
  Users,
  ShieldAlert,
  ShieldChevron,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleToggleAdmin = () => {
    if (!userDocRef) return;
    setIsUpdatingRole(true);
    const newRole = profile?.role === "admin" ? "patient" : "admin";
    updateDocumentNonBlocking(userDocRef, { role: newRole });
    
    toast({ 
      title: newRole === "admin" ? "Admin Access Granted" : "Role Reset", 
      description: newRole === "admin" ? "You now have access to the Emergency Dispatch dashboard." : "Role returned to patient."
    });
    
    setTimeout(() => setIsUpdatingRole(false), 1000);
  };

  const handleAddEmergencyContact = () => {
    if (!userDocRef || !newContact.name || !newContact.phone) return;
    
    updateDocumentNonBlocking(userDocRef, {
      emergencyContacts: arrayUnion({
        ...newContact,
        id: Math.random().toString(36).substr(2, 9)
      })
    });

    toast({ title: "Contact Added", description: `${newContact.name} has been added to your emergency list.` });
    setNewContact({ name: "", phone: "", relation: "" });
    setIsAddContactOpen(false);
  };

  const handleRemoveContact = (contact: any) => {
    if (!userDocRef) return;
    updateDocumentNonBlocking(userDocRef, {
      emergencyContacts: arrayRemove(contact)
    });
    toast({ title: "Contact Removed", description: "Emergency contact has been removed." });
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
      <main className="max-w-2xl mx-auto px-4 space-y-6">
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
                <Badge variant="secondary" className="bg-primary/10 text-primary capitalize font-bold">
                  {profile?.role || "User"}
                </Badge>
                {profile?.role === "doctor" && (
                  <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
                {profile?.role === "admin" && (
                  <Badge variant="destructive" className="flex items-center gap-1 uppercase text-[10px] font-black">
                    <ShieldCheck className="h-3 w-3" /> System Admin
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
            </div>
          </CardContent>
        </Card>

        {/* Prototype/Dev Feature: Elevation to Admin */}
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldChevron className="h-4 w-4 text-primary" /> Prototype Settings
            </CardTitle>
            <CardDescription className="text-xs">
              This section is for testing purposes only. You can toggle Admin status to view the SOS Dispatch dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleToggleAdmin} 
              disabled={isUpdatingRole}
              variant={profile?.role === "admin" ? "outline" : "default"}
              className="w-full h-12 rounded-2xl font-bold"
            >
              {isUpdatingRole ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : profile?.role === "admin" ? (
                "Demote to Patient Role"
              ) : (
                "Elevate to System Admin"
              )}
            </Button>
          </CardContent>
        </Card>

        {profile?.role !== "doctor" && (
          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Emergency Contacts</CardTitle>
              </div>
              <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 border-primary/20 text-primary">
                    <Plus className="h-4 w-4 mr-1" /> Add New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Emergency Contact</DialogTitle>
                    <DialogDescription>
                      These people will be alerted during an SOS emergency.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="e.g. John Doe" 
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input 
                        placeholder="10 digit number" 
                        maxLength={10}
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relation</Label>
                      <Input 
                        placeholder="e.g. Spouse, Parent" 
                        value={newContact.relation}
                        onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEmergencyContact} className="w-full bg-primary">
                      Save Contact
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {profile?.emergencyContacts?.length > 0 ? (
                <div className="grid gap-3">
                  {profile.emergencyContacts.map((contact: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-destructive">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{contact.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{contact.relation || "Emergency Contact"}</p>
                          <p className="text-xs font-medium">{contact.phone}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveContact(contact)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-2xl">
                  <p className="text-sm">No emergency contacts added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-sm">
          <CardFooter className="pt-6 flex flex-col gap-4">
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
