
"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Plus, 
  FileText, 
  Send, 
  Loader2, 
  CreditCard, 
  History, 
  AlertCircle,
  Hospital as HospitalIcon,
  CheckCircle2,
  XCircle,
  Info,
  Lock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { hospitals } from "@/lib/mock-data";
import Link from "next/link";

export default function InsurancePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const insuranceQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "insurance"));
  }, [db, user?.uid]);

  const claimsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "claims"));
  }, [db, user?.uid]);

  const { data: policies, isLoading: loadingPolicies } = useCollection(insuranceQuery);
  const { data: claims, isLoading: loadingClaims } = useCollection(claimsQuery);

  const [newPolicy, setNewPolicy] = useState({ provider: "", policyNumber: "", planName: "", coverageAmount: 0 });
  const [newClaim, setNewClaim] = useState({ policyId: "", amount: 0, description: "" });

  const handleAddPolicy = () => {
    if (!db || !user?.uid) return;
    const colRef = collection(db, "users", user.uid, "insurance");
    addDocumentNonBlocking(colRef, {
      ...newPolicy,
      status: "active",
      createdAt: serverTimestamp(),
    });
    toast({ title: "Policy Added", description: "Your insurance information has been saved." });
    setNewPolicy({ provider: "", policyNumber: "", planName: "", coverageAmount: 0 });
  };

  const handleFileClaim = () => {
    if (!db || !user?.uid) return;
    const colRef = collection(db, "users", user.uid, "claims");
    addDocumentNonBlocking(colRef, {
      ...newClaim,
      status: "submitted",
      date: serverTimestamp(),
    });
    toast({ title: "Claim Filed", description: "Your claim has been submitted for review." });
    setNewClaim({ policyId: "", amount: 0, description: "" });
  };

  if (!mounted || isUserLoading) {
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
            <CardTitle className="text-2xl font-bold mb-4">Insurance Portal Locked</CardTitle>
            <CardDescription className="text-base mb-8">
              Managing insurance policies and filing claims requires a secure account. Please log in to continue.
            </CardDescription>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-primary h-12 text-lg rounded-2xl shadow-xl">
                <Link href="/login">Secure Login</Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 text-muted-foreground">
                <Link href="/register">Register New Account</Link>
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
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Insurance & Claims</h1>
            <p className="text-muted-foreground">Manage your health coverage and medical claims.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Add New Policy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Insurance Policy</DialogTitle>
                <DialogDescription>Enter your health insurance details below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input 
                    placeholder="e.g. LIC, Apollo Munich, Star Health" 
                    value={newPolicy.provider}
                    onChange={(e) => setNewPolicy({...newPolicy, provider: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Policy Number</Label>
                  <Input 
                    placeholder="POL-12345678" 
                    value={newPolicy.policyNumber}
                    onChange={(e) => setNewPolicy({...newPolicy, policyNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input 
                    placeholder="Family Floater / Gold Plan" 
                    value={newPolicy.planName}
                    onChange={(e) => setNewPolicy({...newPolicy, planName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coverage Amount (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="500000" 
                    value={newPolicy.coverageAmount || ""}
                    onChange={(e) => setNewPolicy({...newPolicy, coverageAmount: Number(e.target.value)})}
                  />
                </div>
                <Button onClick={handleAddPolicy} className="w-full bg-primary mt-4">Save Policy</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-primary h-5 w-5" /> Your Policies
              </h2>
              {loadingPolicies ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
              ) : policies && policies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policies.map((policy) => (
                    <Card key={policy.id} className="border-none shadow-md overflow-hidden group">
                      <CardHeader className="bg-primary/5 pb-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{policy.provider}</CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 capitalize">{policy.status}</Badge>
                        </div>
                        <CardDescription>{policy.planName}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Policy No:</span>
                          <span className="font-bold">{policy.policyNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coverage:</span>
                          <span className="font-bold">₹{policy.coverageAmount?.toLocaleString()}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">File a Claim</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>File a New Claim</DialogTitle>
                              <DialogDescription>Submit a reimbursement request for {policy.provider}.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label>Claim Amount (₹)</Label>
                                <Input 
                                  type="number" 
                                  placeholder="0.00"
                                  value={newClaim.amount || ""}
                                  onChange={(e) => setNewClaim({...newClaim, amount: Number(e.target.value), policyId: policy.id})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Input 
                                  placeholder="e.g. Hospitalization, Blood tests"
                                  value={newClaim.description}
                                  onChange={(e) => setNewClaim({...newClaim, description: e.target.value, policyId: policy.id})}
                                />
                              </div>
                              <Button onClick={handleFileClaim} className="w-full bg-primary mt-4">Submit Claim</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/30 border-dashed border-2 p-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No insurance policies found. Add one to get started.</p>
                </Card>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HospitalIcon className="text-primary h-5 w-5" /> Network Coverage
              </h2>
              <div className="grid gap-4">
                {policies && policies.length > 0 ? (
                  policies.map((policy) => {
                    const compatibleHospitals = hospitals.filter(h => 
                      h.acceptedInsurance.some(ins => ins.toLowerCase() === policy.provider.toLowerCase())
                    );
                    
                    return (
                      <Card key={`network-${policy.id}`} className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="py-4 bg-accent/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span className="font-bold text-sm">{policy.provider} Network</span>
                            </div>
                            <Badge variant="outline" className="bg-white">
                              {compatibleHospitals.length} Compatible Hospitals
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {hospitals.map((hosp) => {
                              const isCompatible = compatibleHospitals.some(ch => ch.id === hosp.id);
                              return (
                                <div key={hosp.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <HospitalIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>{hosp.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isCompatible ? (
                                      <div className="flex items-center gap-1 text-primary">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-[10px] font-bold">COVERED</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-[10px]">NOT IN NETWORK</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic">Add a policy to see compatible hospital networks.</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <History className="text-primary h-5 w-5" /> Recent Claims
              </h2>
              {loadingClaims ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
              ) : claims && claims.length > 0 ? (
                <div className="space-y-3">
                  {claims.map((claim) => (
                    <Card key={claim.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{claim.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {claim.date?.toDate ? new Date(claim.date.toDate()).toLocaleDateString() : 'Just now'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="font-bold text-sm">₹{claim.amount?.toLocaleString()}</span>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">
                            {claim.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No claims filed yet.</p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><AlertCircle /> Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/10 p-3 rounded-lg text-sm">
                  Check the "Network Coverage" section to ensure your chosen hospital accepts your policy.
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-sm">
                  Claims are usually processed within 3-5 business days.
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-accent/50">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Info className="h-4 w-4" /> Policy Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Our system automatically maps your active policies to the nearest network hospitals to save you time during emergencies.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-white" asChild>
                  <Link href="/hospitals">View Hospital Map</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
