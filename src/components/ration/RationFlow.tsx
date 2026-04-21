import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserPlus, Users, MapPin, CreditCard, Camera, CheckCircle2, Loader2, UserCheck, QrCode } from "lucide-react";

type Member = { name: string; age: number; relation: string; photo: string };
const avatar = (s: string) => `https://api.dicebear.com/7.x/personas/svg?seed=${s}`;
const family = {
  rationId: "RAT-2024-001",
  headOfFamily: "Ramesh Kumar",
  address: "42, Gandhi Nagar, Ward 7, New Delhi - 110001",
  cardType: "BPL (Yellow)",
  members: [
    { name: "Ramesh Kumar", age: 48, relation: "Self", photo: avatar("ramesh") },
    { name: "Sunita Devi", age: 44, relation: "Wife", photo: avatar("sunita") },
    { name: "Amit Kumar", age: 22, relation: "Son", photo: avatar("amit") },
    { name: "Priya Kumar", age: 18, relation: "Daughter", photo: avatar("priya") },
  ] as Member[],
};

type Step = "login" | "family" | "face" | "select" | "qr";
const Shell = ({ children, max = "max-w-md" }: { children: React.ReactNode; max?: string }) => (
  <div className="min-h-screen bg-background p-4 flex items-center justify-center">
    <Card className={`w-full ${max} shadow-xl`}>{children}</Card>
  </div>
);

const RationFlow = () => {
  const [step, setStep] = useState<Step>("login");
  const [collector, setCollector] = useState<Member | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ rationId: "", password: "", confirm: "", name: "" });
  const [msg, setMsg] = useState<{ err?: string; ok?: string }>({});
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<"idle" | "on" | "verifying" | "done">("idle");
  const [showOk, setShowOk] = useState(false);

  const set = (k: keyof typeof form, v: string) => { setForm({ ...form, [k]: v }); setMsg({}); };
  const email = (id: string) => `${id.trim().toLowerCase()}@ration.local`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({});
    if (isSignUp) {
      if (!form.name.trim()) return setMsg({ err: "Full name is required" });
      if (!form.rationId.trim()) return setMsg({ err: "Ration Card ID is required" });
      if (form.password.length < 6) return setMsg({ err: "Password must be at least 6 characters" });
      if (form.password !== form.confirm) return setMsg({ err: "Passwords do not match" });
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email(form.rationId), password: form.password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: form.name, ration_id: form.rationId } },
      });
      setLoading(false);
      if (error) return setMsg({ err: error.message });
      setMsg({ ok: "Account created successfully! Please sign in." });
      setIsSignUp(false);
      setForm({ ...form, confirm: "", name: "" });
    } else {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email: email(form.rationId), password: form.password });
      setLoading(false);
      if (error) return setMsg({ err: "Invalid Ration ID or password" });
      setStep("family");
    }
  };

  const stopCam = useCallback(() => {
    (videoRef.current?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
  }, []);
  useEffect(() => () => stopCam(), [stopCam]);

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) { videoRef.current.srcObject = s; setCam("on"); }
    } catch { alert("Camera access denied. Please allow camera permissions."); }
  };
  const verify = () => {
    setCam("verifying");
    setTimeout(() => { setCam("done"); stopCam(); setTimeout(() => setStep("select"), 1200); }, 2000);
  };

  useEffect(() => {
    if (step !== "qr") return;
    const t = setTimeout(() => setShowOk(true), 3000);
    return () => clearTimeout(t);
  }, [step]);

  const logout = async () => {
    await supabase.auth.signOut();
    setStep("login"); setCollector(null); setForm({ rationId: "", password: "", confirm: "", name: "" });
    setCam("idle"); setShowOk(false);
  };

  // ------- LOGIN -------
  if (step === "login") {
    const fields: Array<[keyof typeof form, string, string, string?]> = isSignUp
      ? [["name", "Full Name", "Enter your full name"], ["rationId", "Ration Card ID", "e.g. RAT-2024-001"],
         ["password", "Password", "Create a password", "password"], ["confirm", "Confirm Password", "Confirm your password", "password"]]
      : [["rationId", "Ration Card ID", "e.g. RAT-2024-001"], ["password", "Password", "Enter your password", "password"]];
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {isSignUp ? <UserPlus className="w-8 h-8 text-primary" /> : <ShieldCheck className="w-8 h-8 text-primary" />}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">{isSignUp ? "Create Account" : "Smart Ration System"}</CardTitle>
            <p className="text-muted-foreground text-sm">{isSignUp ? "Register a new ration card account" : "Enter your Ration ID and password to continue"}</p>
          </CardHeader>
          <CardContent>
            {msg.ok && <p className="text-sm text-center mb-4 text-primary bg-primary/10 rounded-md p-2">{msg.ok}</p>}
            <form onSubmit={submit} className="space-y-4">
              {fields.map(([k, label, ph, type]) => (
                <div key={k} className="space-y-2">
                  <Label htmlFor={k}>{label}</Label>
                  <Input id={k} type={type} placeholder={ph} value={form[k]} onChange={(e) => set(k, e.target.value)} />
                </div>
              ))}
              {msg.err && <p className="text-destructive text-sm text-center">{msg.err}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setMsg({}); }} className="text-sm text-primary hover:underline">
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------- FAMILY -------
  if (step === "family") return (
    <Shell max="max-w-2xl">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Family Details</CardTitle>
          <Badge className="bg-accent text-accent-foreground">{family.cardType}</Badge>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" />{family.rationId}</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{family.address}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm font-semibold text-muted-foreground mb-3">Head of Family: <span className="text-foreground">{family.headOfFamily}</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {family.members.map((m) => (
            <div key={m.name} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <img src={m.photo} alt={m.name} className="w-12 h-12 rounded-full bg-muted" />
              <div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.relation} · Age {m.age}</p></div>
            </div>
          ))}
        </div>
        <Button onClick={() => setStep("face")} className="w-full" size="lg">Proceed to Face Verification</Button>
      </CardContent>
    </Shell>
  );

  // ------- FACE -------
  if (step === "face") return (
    <Shell>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2"><Camera className="w-5 h-5 text-primary" />Face Verification</CardTitle>
        <p className="text-sm text-muted-foreground">Look at the camera and click verify</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-64 h-64 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center relative">
          {cam === "done" && <div className="absolute inset-0 bg-success/20 flex items-center justify-center z-10"><CheckCircle2 className="w-16 h-16 text-success" /></div>}
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cam === "on" || cam === "verifying" ? "block" : "hidden"}`} />
          {cam === "idle" && <Camera className="w-12 h-12 text-muted-foreground" />}
        </div>
        {cam === "idle" && <Button onClick={startCam} className="w-full" size="lg">Start Camera</Button>}
        {cam === "on" && <Button onClick={verify} className="w-full" size="lg">Verify Face</Button>}
        {cam === "verifying" && <Button disabled className="w-full" size="lg"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</Button>}
        {cam === "done" && <p className="text-success font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Verification Successful</p>}
      </CardContent>
    </Shell>
  );

  // ------- SELECT -------
  if (step === "select") return (
    <Shell>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2"><UserCheck className="w-5 h-5 text-primary" />Select Collector</CardTitle>
        <p className="text-sm text-muted-foreground">Who will collect the ration today?</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {family.members.map((m) => (
          <button key={m.name} onClick={() => { setCollector(m); setStep("qr"); }}
            className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
            <img src={m.photo} alt={m.name} className="w-11 h-11 rounded-full bg-muted" />
            <div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.relation} · Age {m.age}</p></div>
          </button>
        ))}
      </CardContent>
    </Shell>
  );

  // ------- QR -------
  if (step === "qr" && collector) {
    const qr = JSON.stringify({ rationId: family.rationId, headOfFamily: family.headOfFamily, collector: collector.name, collectorRelation: collector.relation, cardType: family.cardType, timestamp: new Date().toISOString() });
    return (
      <Shell>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold flex items-center justify-center gap-2"><QrCode className="w-5 h-5 text-primary" />Ration Collection QR</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="p-4 bg-card rounded-xl border border-border"><QRCodeSVG value={qr} size={200} /></div>
          <div className="text-center text-sm space-y-1">
            <p className="text-muted-foreground">Ration ID: <span className="font-medium text-foreground">{family.rationId}</span></p>
            <p className="text-muted-foreground">Collector: <span className="font-medium text-foreground">{collector.name}</span> ({collector.relation})</p>
          </div>
          {showOk && (
            <div className="w-full p-4 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="font-semibold text-success">Ration Given Successfully!</span>
            </div>
          )}
          <Button onClick={logout} variant="outline" className="w-full mt-2">Logout</Button>
        </CardContent>
      </Shell>
    );
  }
  return null;
};

export default RationFlow;