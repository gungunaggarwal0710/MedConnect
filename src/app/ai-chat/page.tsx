
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, AlertCircle, Loader2, Stethoscope, Activity, RefreshCcw, Star, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { aiSymptomAnalysisAndRecommendation } from "@/ai/flows/ai-symptom-analysis-and-recommendation-flow";
import { useToast } from "@/hooks/use-toast";
import { mockDoctors } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

type AnalysisResult = {
  analysis: string;
  risks: string;
  specialistRecommendation: string;
};

export default function AIChatPage() {
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB allowed", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast({ title: "Error", description: "Please describe your symptoms", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await aiSymptomAnalysisAndRecommendation({
        symptoms,
        photoDataUri: image || undefined
      });
      setResult(response);
      toast({ title: "Analysis Complete", description: "Your health report is ready." });
    } catch (error: any) {
      console.error("Analysis Error:", error);
      toast({ 
        title: "Analysis Failed", 
        description: error.message || "Something went wrong. Please try again with more details.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const recommendedDoctors = useMemo(() => {
    if (!result) return [];
    return mockDoctors
      .filter(doc => doc.specialty === result.specialistRecommendation)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [result]);

  return (
    <div className="pb-24 pt-4 md:pt-24 min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MedConnect+ AI</h1>
            <p className="text-sm text-muted-foreground">Expert symptom analysis & doctor matching</p>
          </div>
        </div>

        {!result ? (
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-lg">What are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe your symptoms in detail</label>
                <Textarea 
                  placeholder="e.g. Sharp pain in chest since morning, mild fever..."
                  className="min-h-[120px]"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Attach photo of condition (Optional)</label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {image ? (
                    <div className="relative group">
                      <img src={image} alt="Upload" className="max-h-48 rounded-md" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                        <RefreshCcw className="text-white h-8 w-8" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center">
                        Upload rashes, wounds, or swelling (Max 10MB)
                      </span>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="image-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <strong>Disclaimer:</strong> This is an AI preliminary analysis and not a professional medical diagnosis. For emergencies, please use the SOS button.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAnalyze} 
                disabled={loading} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Medical Data...
                  </>
                ) : (
                  <>
                    Analyze Symptoms
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-l-4 border-l-primary bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Analysis Results
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setResult(null)}>New Check</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Findings</h3>
                  <p className="text-foreground leading-relaxed">{result.analysis}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-bold text-sm text-red-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Potential Risks
                  </h3>
                  <p className="text-sm text-red-800">{result.risks}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-bold text-sm text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> Recommended Specialty
                  </h3>
                  <p className="text-sm font-semibold text-green-900">{result.specialistRecommendation}</p>
                </div>

                {recommendedDoctors.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" /> Top Specialists for You
                    </h3>
                    <div className="grid gap-4">
                      {recommendedDoctors.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all group">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border">
                            <img src={`https://picsum.photos/seed/doc${doc.id}/200`} alt={doc.name} className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{doc.name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">{doc.degree}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-foreground">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> {doc.rating}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <MapPin className="h-2.5 w-2.5" /> {doc.location.split(',')[0]}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" className="h-8 bg-primary" asChild>
                            <a href={`/doctors?specialty=${doc.specialty}`}>Book ₹{doc.fee}</a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex flex-col gap-3">
                <Button className="w-full bg-primary" asChild>
                  <a href={`/doctors?specialty=${result.specialistRecommendation}`}>Explore All Matching Specialists</a>
                </Button>
                <p className="text-[10px] text-muted-foreground text-center italic">
                  Analysis generated based on provided symptoms and image.
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
