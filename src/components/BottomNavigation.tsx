import { BarChart3, ClipboardList, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

let navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: Users },
  { id: "assessment", label: "Assessment", icon: ClipboardList },
  { id: "daily", label: "Daily Plan", icon: Target },
];

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const{ user } = useAuth();
  useEffect(() => {
    if(user?.role === 'coach' && !navItems.find(item => item.id === "signup")){
     navItems.push({    id: "signup", label: "SignUp", icon: Users });
    }  
    else{
      navItems = [...navItems.filter(a=>a.id != "signup")];
    }
  }, [user]);
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "transition-all duration-300",
                  isActive && "animate-bounce-in"
                )} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};