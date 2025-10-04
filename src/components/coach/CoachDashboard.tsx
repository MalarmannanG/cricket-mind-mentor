import { Player } from '@/types';
import { StatCard } from './StatCard';
import { TrendingUp, TrendingDown, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEffect, useState } from 'react';
import { initializeMockPlayers } from '@/utils/mockData';
import { getUserAll } from '@/api/users';

interface CoachDashboardProps {
  //players: Player[];
  onTabChange: (playerId: string) => void;
}

export function CoachDashboard( { onTabChange }: CoachDashboardProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const playersWithResults = players.filter(p => p.results);
  const totalScore = playersWithResults.reduce((sum, p) => sum + (p.results?.score || 0), 0);
  const avgScore = playersWithResults.length > 0 ? totalScore / playersWithResults.length : 0;

  const sortedByScore = [...playersWithResults].sort((a, b) => 
    (b.results?.score || 0) - (a.results?.score || 0)
  );
  const bestPlayer = sortedByScore[0];
  const worstPlayer = sortedByScore[sortedByScore.length - 1];
    const handleViewPlayer = (playerId: string) => {
    // Navigate to player report view
       onTabChange(playerId);
  };
  useEffect(() => {
    if (players.length === 0) {
      getUserAll().then(async(res:any[]) => {
        console.log('Fetched users:', res);
        setPlayers(res.filter(u => u.role == 'player'));
      }).catch(err => {
        console.error('Error fetching users:', err);
      });
    }
  }, []);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Average"
          value={`${avgScore.toFixed(1)}%`}
          icon={Users}
          description="Overall team performance"
        />
        <StatCard
          title="Best Performer"
          value={bestPlayer?.name || 'N/A'}
          icon={TrendingUp}
          description={`${bestPlayer?.results?.score.toFixed(1)}%`}
        />
        <StatCard
          title="Needs Attention"
          value={worstPlayer?.name || 'N/A'}
          icon={TrendingDown}
          description={`${worstPlayer?.results?.score.toFixed(1)}%`}
        />
        <StatCard
          title="Total Players"
          value={players.length}
          icon={Award}
          description="Active in system"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{player.name}</h3>
                  {player.results && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Score: <span className="font-medium text-foreground">
                          {player.results.score.toFixed(1)}%
                        </span>
                      </p>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, player.results.score)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPlayer(player.id)}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
