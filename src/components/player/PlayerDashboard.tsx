import { Player, DailyCompletion, ActionPlanItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { initializeMockPlayers } from '@/utils/mockData';
import { useAuth, userInfo } from '@/contexts/AuthContext';
import { getDailyCompletionByPlayer } from '@/api/dailyCompletion';
import { getActionPlanByPlayer } from '@/api/actionPlan';
import { listResultsByPlayer } from '@/api/results';

interface PlayerDashboardProps {
  player: Player;
  dailyCompletion: DailyCompletion | null;
  actionPlan: ActionPlanItem[];
}

export function PlayerDashboard() {
  const { setLoading, user } = useAuth();
  const [player, setPlayer] = useLocalStorage<Player>('currentUser', null);
  const [completedCount, setCompletedCount] = useState(0);
  const [actionPlan, setActionPlan] = useState<ActionPlanItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [dailyCompletion, setDailyCompletion] = useState<DailyCompletion>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    console.info('user from local storage:', user);
    async function fetchDailyCompletionByPlayer() {
      const qs: any[] = await getDailyCompletionByPlayer(user.id);
      if (qs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todayCompletion = qs.find(
          dc => dc.playerId === player.id && dc.date.toDate().toISOString().split('T')[0] == today
        );
        setDailyCompletion(todayCompletion ? todayCompletion : null);
        const completedCount = todayCompletion ? todayCompletion.items.filter(i => i.completed).length : 0;
        setCompletedCount(completedCount);
        const totalCount = todayCompletion ? todayCompletion.items.length : 0;
        setTotalCount(totalCount);
        setCompletionPercentage((completedCount / totalCount) * 100);
      }
    }
    async function fetchTestResult(playerId: string) {
      const qs: any[] = await listResultsByPlayer(playerId);
      if (qs.length > 0) {
        setPlayer(qs[0]);
      }
    }
    if (user) {
      setLoading(true);
      getActionPlanByPlayer().then(async (res: any) => {
        console.log('Fetched action plan:', res);
        setActionPlan(res ? res : []);
        await fetchDailyCompletionByPlayer();
        await fetchTestResult(user.id);
      }).catch(err => {
        console.error('Error fetching action plan:', err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, []);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {user.name}!</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your daily mental training progress
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Today's Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{totalCount} completed
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>

            {player.results && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2">Your Latest Score</h4>
                <p className="text-3xl font-bold text-primary">
                  {player.results.rawScore.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionPlan && actionPlan?.map((item) => {
              const completion = dailyCompletion?.items.find(i => i.itemId === item.id);
              const isCompleted = completion?.completed || false;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-card'
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
