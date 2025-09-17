import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Trophy, AlertTriangle } from "lucide-react";

const mockPlayers = [
  { name: "Rahul", score: 63, trend: "up" },
  { name: "Arjun", score: 75, trend: "up" },
  { name: "Vikram", score: 45, trend: "down" },
];

const topBlockers = [
  "Fear of failure in critical moments",
  "Difficulty maintaining focus under pressure", 
  "Negative self-talk during poor performance",
  "Overthinking technical aspects during play"
];

export const Dashboard = () => {
  const teamAverage = Math.round(mockPlayers.reduce((sum, p) => sum + p.score, 0) / mockPlayers.length);
  const bestPlayer = mockPlayers.reduce((best, current) => current.score > best.score ? current : best);
  const worstPlayer = mockPlayers.reduce((worst, current) => current.score < worst.score ? current : worst);

  return (
    <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-field bg-clip-text text-transparent">
          Cricket Coach Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Team Mental Performance Overview</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card border-0 bg-gradient-field text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Team Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamAverage}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-success border-0 bg-gradient-performance text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-1">
              <Trophy size={16} />
              Best Player
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{bestPlayer.name}</div>
            <div className="text-sm opacity-90">{bestPlayer.score}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Players List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Player Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockPlayers.map((player) => (
            <div key={player.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-field flex items-center justify-center text-white font-bold">
                  {player.name[0]}
                </div>
                <div>
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-muted-foreground">Mental Score</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={player.score >= 70 ? "default" : player.score >= 50 ? "secondary" : "destructive"}
                  className="font-bold"
                >
                  {player.score}%
                </Badge>
                {player.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Worst Performer Alert */}
      <Card className="shadow-card border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{worstPlayer.name}</div>
              <div className="text-sm text-muted-foreground">Requires immediate support</div>
            </div>
            <Badge variant="destructive">{worstPlayer.score}%</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top Blockers */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Top Mental Blockers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topBlockers.map((blocker, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-warning/20 text-warning flex items-center justify-center text-sm font-bold mt-0.5">
                  {index + 1}
                </div>
                <div className="text-sm text-foreground flex-1">{blocker}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};