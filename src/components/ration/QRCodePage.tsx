import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Family, FamilyMember } from "@/data/mockFamilies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2 } from "lucide-react";

interface QRCodePageProps {
  family: Family;
  collector: FamilyMember;
  onLogout: () => void;
}

const QRCodePage = ({ family, collector, onLogout }: QRCodePageProps) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(true), 3000);
    return () => clearTimeout(timer);
  }, []);

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

          <Button onClick={onLogout} variant="outline" className="w-full mt-2">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePage;
