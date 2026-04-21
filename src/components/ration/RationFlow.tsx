import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { families, Family, FamilyMember } from "@/data/mockFamilies";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  UserPlus,
  Users,
  MapPin,
  CreditCard,
  Camera,
  CheckCircle2,
  Loader2,
  UserCheck,
  QrCode,
} from "lucide-react";

type Step = "login" | "family" | "face" | "select" | "qr";

const RationFlow = () => {
  const [step, setStep] = useState<Step>("login");
  const [family, setFamily] = useState<Family | null>(null);
  const [collector, setCollector] = useState<FamilyMember | null>(null);

  // login/signup state
  const [isSignUp, setIsSignUp] = useState(false);
  const [rationId, setRationId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // face verification state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // qr success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Convert ration id to a stable email for Supabase auth
  const rationEmail = (id: string) => `${id.trim().toLowerCase()}@ration.local`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: rationEmail(rationId),
      password,
    });
    setLoading(false);
    if (authError) {
      setError("Invalid Ration ID or password");
      return;
    }
    const found =
      families.find((f) => f.rationId === rationId) ?? families[0];
    setFamily(found);
    setStep("family");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) return setError("Full name is required");
    if (!rationId.trim()) return setError("Ration Card ID is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    const { error: signErr } = await supabase.auth.signUp({
      email: rationEmail(rationId),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, ration_id: rationId },
      },
    });
    setLoading(false);
    if (signErr) {
      setError(signErr.message);
      return;
    }
    setSuccess("Account created successfully! Please sign in.");
    setIsSignUp(false);
    setConfirmPassword("");
    setFullName("");
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      stopCamera();
      setTimeout(() => setStep("select"), 1200);
    }, 2000);
  };

  useEffect(() => {
    if (step !== "qr") return;
    const t = setTimeout(() => setShowSuccess(true), 3000);
    return () => clearTimeout(t);
  }, [step]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setFamily(null);
    setCollector(null);
    setStep("login");
    setRationId("");
    setPassword("");
    setVerified(false);
    setStreaming(false);
    setShowSuccess(false);
  };

  // ============ LOGIN / SIGN UP ============
  if (step === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {isSignUp ? <UserPlus className="w-8 h-8 text-primary" /> : <ShieldCheck className="w-8 h-8 text-primary" />}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isSignUp ? "Create Account" : "Smart Ration System"}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {isSignUp ? "Register a new ration card account" : "Enter your Ration ID and password to continue"}
            </p>
          </CardHeader>
          <CardContent>
            {success && (
              <p className="text-sm text-center mb-4 text-primary bg-primary/10 rounded-md p-2">{success}</p>
            )}

            {isSignUp ? (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="Enter your full name" value={fullName} onChange={(e) => { setFullName(e.target.value); setError(""); }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rationId">Ration Card ID</Label>
                  <Input id="rationId" placeholder="e.g. RAT-2024-001" value={rationId} onChange={(e) => { setRationId(e.target.value); setError(""); }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Create a password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} />
                </div>
                {error && <p className="text-destructive text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rationId">Ration Card ID</Label>
                  <Input id="rationId" placeholder="e.g. RAT-2024-001" value={rationId} onChange={(e) => { setRationId(e.target.value); setError(""); }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
                </div>
                {error && <p className="text-destructive text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">Sign up first to create an account</p>
              </form>
            )}

            <div className="mt-4 text-center">
              <button type="button" onClick={toggleMode} className="text-sm text-primary hover:underline">
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ FAMILY DETAILS ============
  if (step === "family" && family) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Family Details
              </CardTitle>
              <Badge className="bg-accent text-accent-foreground">{family.cardType}</Badge>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> {family.rationId}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {family.address}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-muted-foreground mb-3">
              Head of Family: <span className="text-foreground">{family.headOfFamily}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {family.members.map((m) => (
                <div key={m.name} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <img src={m.photo} alt={m.name} className="w-12 h-12 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.relation} · Age {m.age}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setStep("face")} className="w-full" size="lg">
              Proceed to Face Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ FACE VERIFICATION ============
  if (step === "face") {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Face Verification
            </CardTitle>
            <p className="text-sm text-muted-foreground">Look at the camera and click verify</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-64 h-64 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center relative">
              {verified && (
                <div className="absolute inset-0 bg-success/20 flex items-center justify-center z-10">
                  <CheckCircle2 className="w-16 h-16 text-success" />
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${streaming ? "block" : "hidden"}`} />
              {!streaming && !verified && <Camera className="w-12 h-12 text-muted-foreground" />}
            </div>

            {!streaming && !verified && (
              <Button onClick={startCamera} className="w-full" size="lg">Start Camera</Button>
            )}
            {streaming && !verifying && !verified && (
              <Button onClick={handleVerify} className="w-full" size="lg">Verify Face</Button>
            )}
            {verifying && (
              <Button disabled className="w-full" size="lg">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...
              </Button>
            )}
            {verified && (
              <p className="text-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Verification Successful
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ MEMBER SELECTION ============
  if (step === "select" && family) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Select Collector
            </CardTitle>
            <p className="text-sm text-muted-foreground">Who will collect the ration today?</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {family.members.map((m) => (
              <button
                key={m.name}
                onClick={() => { setCollector(m); setStep("qr"); }}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <img src={m.photo} alt={m.name} className="w-11 h-11 rounded-full bg-muted" />
                <div>
                  <p className="font-medium text-foreground text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.relation} · Age {m.age}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ QR CODE ============
  if (step === "qr" && family && collector) {
    const qrData = JSON.stringify({
      rationId: family.rationId,
      headOfFamily: family.headOfFamily,
      collector: collector.name,
      collectorRelation: collector.relation,
      cardType: family.cardType,
      timestamp: new Date().toISOString(),
    });

    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Ration Collection QR
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <QRCodeSVG value={qrData} size={200} />
            </div>
            <div className="text-center text-sm space-y-1">
              <p className="text-muted-foreground">
                Ration ID: <span className="font-medium text-foreground">{family.rationId}</span>
              </p>
              <p className="text-muted-foreground">
                Collector: <span className="font-medium text-foreground">{collector.name}</span> ({collector.relation})
              </p>
            </div>

            {showSuccess && (
              <div className="w-full p-4 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="font-semibold text-success">Ration Given Successfully!</span>
              </div>
            )}

            <Button onClick={handleLogout} variant="outline" className="w-full mt-2">Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default RationFlow;