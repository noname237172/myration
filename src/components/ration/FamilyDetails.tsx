import { Family } from "@/data/mockFamilies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, CreditCard } from "lucide-react";

interface FamilyDetailsProps {
  family: Family;
  onProceed: () => void;
}

const FamilyDetails = ({ family, onProceed }: FamilyDetailsProps) => {
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
            <span className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" /> {family.rationId}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {family.address}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">
            Head of Family: <span className="text-foreground">{family.headOfFamily}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {family.members.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <img
                  src={m.photo}
                  alt={m.name}
                  className="w-12 h-12 rounded-full bg-muted"
                />
                <div>
                  <p className="font-medium text-foreground text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.relation} · Age {m.age}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={onProceed} className="w-full" size="lg">
            Proceed to Face Verification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyDetails;
