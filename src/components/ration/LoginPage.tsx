import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserPlus } from "lucide-react";

interface LoginPageProps {
  onLogin: (rationId: string, password: string) => string | null;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [rationId, setRationId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onLogin(rationId, password);
    if (err) setError(err);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Full name is required"); return; }
    if (!rationId.trim()) { setError("Ration Card ID is required"); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setSuccess("Account created successfully! Please sign in.");
    setIsSignUp(false);
    setConfirmPassword("");
    setFullName("");
    setError("");
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
  };

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
            <p className="text-sm text-center mb-4 text-green-600 bg-green-50 rounded-md p-2">{success}</p>
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
              <Button type="submit" className="w-full" size="lg">Sign Up</Button>
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
              <Button type="submit" className="w-full" size="lg">Login</Button>
              <p className="text-xs text-muted-foreground text-center mt-2">Demo: RAT-2024-001 / 1234</p>
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
};

export default LoginPage;
