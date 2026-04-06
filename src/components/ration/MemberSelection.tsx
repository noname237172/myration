import { Family, FamilyMember } from "@/data/mockFamilies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

interface MemberSelectionProps {
  family: Family;
  onSelect: (member: FamilyMember) => void;
}

const MemberSelection = ({ family, onSelect }: MemberSelectionProps) => {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Select Collector
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Who will collect the ration today?
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {family.members.map((m) => (
            <button
              key={m.name}
              onClick={() => onSelect(m)}
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
};

export default MemberSelection;
