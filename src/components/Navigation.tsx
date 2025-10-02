import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Calendar,
  BarChart3,
  Users
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { role } = useAuth();

  const coachTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'assessment', label: 'Assessment', icon: ClipboardList },
    { id: 'action-plan', label: 'Action Plan', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const playerTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assessment', label: 'Assessment', icon: ClipboardList },
    { id: 'report', label: 'My Report', icon: FileText },
    { id: 'daily-plan', label: 'Daily Plan', icon: Calendar }
  ];

  const tabs = role === 'coach' ? coachTabs : playerTabs;

  return (
    <div className="flex gap-2 flex-wrap mb-8 p-4 bg-card rounded-lg border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => onTabChange(tab.id)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
