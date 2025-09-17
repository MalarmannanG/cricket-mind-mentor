import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Star, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const mockPlayerData = {
  Rahul: {
    strengths: ["Strong mental resilience", "Excellent focus under pressure", "Positive self-talk"],
    blockers: ["Perfectionist tendencies", "Anxiety before big matches"],
    actionPlan: ["Practice breathing exercises daily", "Work on positive visualization"],
  },
  Arjun: {
    strengths: ["Natural confidence", "Good pressure management", "Team leadership"],
    blockers: ["Overconfidence in easy situations", "Difficulty adapting to strategy changes"],
    actionPlan: ["Mindfulness training", "Scenario-based mental preparation"],
  },
  Vikram: {
    strengths: ["Technical precision", "Good listening skills"],
    blockers: ["Low self-confidence", "Fear of failure", "Negative thought patterns"],
    actionPlan: ["Confidence building exercises", "Regular one-on-one sessions", "Success visualization"],
  },
};

export const PlayerReports = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Load notes from localStorage
  useEffect(() => {
    if (selectedPlayer) {
      const savedNotes = localStorage.getItem(`coach-notes-${selectedPlayer}`);
      setNotes(savedNotes || "");
    }
  }, [selectedPlayer]);

  const saveNotes = () => {
    if (selectedPlayer && notes.trim()) {
      localStorage.setItem(`coach-notes-${selectedPlayer}`, notes);
      toast.success("Notes saved successfully!");
    }
  };

  const playerData = selectedPlayer ? mockPlayerData[selectedPlayer as keyof typeof mockPlayerData] : null;

  return (
    <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-field bg-clip-text text-transparent">
          Player Reports
        </h1>
        <p className="text-muted-foreground mt-2">Individual Performance Analysis</p>
      </div>

      {/* Player Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Select Player</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a player to view report" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(mockPlayerData).map((player) => (
                <SelectItem key={player} value={player}>
                  {player}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Player Report Content */}
      {playerData && (
        <>
          {/* Strengths */}
          <Card className="shadow-success border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Star size={20} />
                Top Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {playerData.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blockers */}
          <Card className="shadow-card border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning-foreground">
                <AlertCircle size={20} className="text-warning" />
                Mental Blockers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {playerData.blockers.map((blocker, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="border-warning/50 text-warning">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{blocker}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card className="shadow-card border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Recommended Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {playerData.actionPlan.map((action, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge className="bg-primary text-primary-foreground mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm flex-1">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coach Notes */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Coach Notes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Private notes for {selectedPlayer} (saved locally)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add your observations, feedback, and action items here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <Button 
                onClick={saveNotes}
                className="w-full bg-gradient-field hover:opacity-90 transition-all"
                disabled={!notes.trim()}
              >
                <Save size={16} className="mr-2" />
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};