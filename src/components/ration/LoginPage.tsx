import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

interface LoginPageProps {
  onLogin: (rationId: string, password: string) => string | null;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [rationId, setRationId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onLogin(rationId, password);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Smart Ration System
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your Ration ID and password to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rationId">Ration Card ID</Label>
              <Input
                id="rationId"
                placeholder="e.g. RAT-2024-001"
                value={rationId}
                onChange={(e) => { setRationId(e.target.value); setError(""); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
            </div>
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Login
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Demo: RAT-2024-001 / 1234
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
