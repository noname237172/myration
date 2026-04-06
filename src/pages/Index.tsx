import { useState } from "react";
import { families, Family, FamilyMember } from "@/data/mockFamilies";
import LoginPage from "@/components/ration/LoginPage";
import FamilyDetails from "@/components/ration/FamilyDetails";
import FaceVerification from "@/components/ration/FaceVerification";
import MemberSelection from "@/components/ration/MemberSelection";
import QRCodePage from "@/components/ration/QRCodePage";

type Step = "login" | "family" | "face" | "select" | "qr";

const Index = () => {
  const [step, setStep] = useState<Step>("login");
  const [family, setFamily] = useState<Family | null>(null);
  const [collector, setCollector] = useState<FamilyMember | null>(null);

  const handleLogin = (rationId: string, password: string): string | null => {
    const found = families.find((f) => f.rationId === rationId && f.password === password);
    if (!found) return "Invalid Ration ID or password";
    setFamily(found);
    setStep("family");
    return null;
  };

  const handleLogout = () => {
    setFamily(null);
    setCollector(null);
    setStep("login");
  };

  if (step === "login") return <LoginPage onLogin={handleLogin} />;
  if (step === "family" && family) return <FamilyDetails family={family} onProceed={() => setStep("face")} />;
  if (step === "face") return <FaceVerification onVerified={() => setStep("select")} />;
  if (step === "select" && family) return <MemberSelection family={family} onSelect={(m) => { setCollector(m); setStep("qr"); }} />;
  if (step === "qr" && family && collector) return <QRCodePage family={family} collector={collector} onLogout={handleLogout} />;

  return null;
};

export default Index;
