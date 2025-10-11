import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Star, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAll } from "@/api/users";
import { listResultsByPlayer } from "@/api/results";
import { ExportReport } from "../ExportReport";
import { AssessmentEvaluation,IPlayers } from "@/types";
import { addAssesmentResult, updateAssesmentResult } from "@/api/assessmentResult";




export const PlayerReports = ({ playerId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayers | null>(null);
  const [players, setPlayers] = useState<IPlayers[]>([]);
  const [playerResult, setPlayerResult] = useState<AssessmentEvaluation | null>(null)
  const [notes, setNotes] = useState<string>("");
  const [playerData, setPlayerData] = useState<{
    strengths: string[];
    blockers: string[];
    actionPlan: string[];
  } | null>(null);
  // Load notes from localStorage

  async function saveNotes(): Promise<void> {

    try {
      const res = playerResult;
      if(res != null && res.id){
      await updateAssesmentResult({ ...res, coachNotes: notes }, res.id);
      }
      else{
        await addAssesmentResult({  coachNotes: notes, playerId: selectedPlayer.id, perQuestion: [] });
      }
      localStorage.setItem(`coach-notes-${selectedPlayer}`, notes);
      toast.success("Notes saved successfully!");
    } catch (err) {
      console.error("Error saving result:", err);
      toast.error("Error saving result");
    } finally {

    }
  }

  useEffect(() => {
    async function fetchTestResult() {
      setLoading(true);
      try {
        const qs: any[] = await listResultsByPlayer(selectedPlayer?.id);
        if (qs.length > 0) {
          const latest = qs[0]
          setPlayerResult(latest);
          setNotes(latest.coachNotes || "");
          latest.perQuestion.filter(a => a.mark > 0)
          setPlayerData({
            strengths: latest.perQuestion.filter(a => a.mark > 0).map(a => a.logic).slice(0, 5) || [],
            blockers: latest.perQuestion.filter(a => a.mark < 0).map(a => a.logic).slice(0, 5) || [],
            actionPlan: latest.actionPlan || []
          });
        }
        else {
          setPlayerData({ strengths: [], blockers: [], actionPlan: [] });
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        toast.error("Error fetching questions");
      } finally {
        setLoading(false);
      }
    }
    if (selectedPlayer) {
      fetchTestResult();
      const savedNotes = localStorage.getItem(`coach-notes-${selectedPlayer}`);

    }
  }, [selectedPlayer]);
  useEffect(() => {
    if (user?.role === "player") {
      setSelectedPlayer(user ? { name: user.name, id: user.id } : null);
    }
    else {
      getUserAll().then(async (res: any[]) => {
        console.log('Fetched users:', res);
        setPlayers(res.map((u: any) => ({ name: u.name, id: u.id })));
        if (playerId) {
          setSelectedPlayer(res.find((p: any) => p.id === playerId) ? { name: res.find((p: any) => p.id === playerId).name, id: playerId } : null);
        }
      }).catch(err => {
        console.error('Error fetching users:', err);
      });
    }
  }, []);
  // const saveNotes = () => {
  //   if (selectedPlayer && notes.trim()) {
  //     localStorage.setItem(`coach-notes-${selectedPlayer}`, notes);
  //     toast.success("Notes saved successfully!");
  //   }
  // };
  const onValueChange = (playerId: string) => {

    setSelectedPlayer(players?.find(p => p.id === playerId) || null);

  }

  //const playerData = selectedPlayer ? players[selectedPlayer as keyof typeof players] : null;

  return (
    <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}


      {/* Player Selection */}
      <Card className="shadow-card">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-center py-4">
              <h1 className="text-3xl font-bold bg-gradient-field bg-clip-text text-left text-transparent">
                Player Reports
              </h1>
              <p className="text-muted-foreground mt-2">Individual Performance Analysis</p>
            </div>
            <ExportReport player={selectedPlayer} playerResult={playerResult}>
              <Button variant="outline" size="sm" className="shadow-card bg-card">
                <FileText size={16} className="mr-2" />
                Export
              </Button>
            </ExportReport>
          </div>
        </CardHeader>
        {user?.role == "coach" && <CardContent>
          <CardTitle className="py-4">Select Player</CardTitle>
          <Select value={selectedPlayer?.id} onValueChange={onValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a player to view report" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>}
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
                {playerData?.strengths.map((strength, index) => (
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
                {playerData?.blockers.map((blocker, index) => (
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
                {playerData?.actionPlan.map((action, index) => (
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
                Private notes for {selectedPlayer.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add your observations, feedback, and action items here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              {user?.role == "coach" && <Button
                onClick={saveNotes}
                className="w-full bg-gradient-field hover:opacity-90 transition-all"
                disabled={!notes.trim()}
              >
                <Save size={16} className="mr-2" />
                Save Notes
              </Button>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};