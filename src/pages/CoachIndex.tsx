import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Dashboard } from "@/components/screens/Dashboard";
import { PlayerReports } from "@/components/screens/PlayerReports";
import { Assessment } from "@/components/screens/Assessment";
import { DailyPlan } from "@/components/screens/DailyPlan";
import { ExportReport } from "@/components/ExportReport";
import { Button } from "@/components/ui/button";
import { FileText, LogOut } from "lucide-react";
import { CoachDashboard } from "@/components/coach/CoachDashboard";
import { AssessmentManager } from "@/components/coach/AssessmentManager";
import { useAuth } from "@/contexts/AuthContext";
import SignUp from "./SignUp";
 
 

const CoachIndex = () => {
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const[playerId, setPlayerId] = useState<string|null>(null);
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("currentUser");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);
  const  onPlayerSelect = (playerId: string) => {
    setPlayerId(playerId);
     setActiveTab("reports");
    // You might want to pass the playerId to PlayerReports component via state or context
  }
  const renderScreen = () => {
    switch (activeTab) {
      case "coach-dashboard":
        return <CoachDashboard onTabChange={onPlayerSelect}/>;
      case "reports":
        return <PlayerReports playerId={playerId}/>;
      case "assessment":
        return <AssessmentManager />;
      case "daily":
        return <DailyPlan />;
        case "signup":
        return <SignUp />;
      default:
             return <CoachDashboard onTabChange={onPlayerSelect}/>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("site");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Bar with Export and Logout */}
      
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        
        <Button variant="outline" size="sm" className="shadow-card bg-card" onClick={handleLogout}>
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default CoachIndex;
