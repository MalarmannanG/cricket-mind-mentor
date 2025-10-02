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
 
 

const CoachIndex = () => {
 
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("currentUser");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  const renderScreen = () => {
    switch (activeTab) {
      case "coach-dashboard":
        return <Dashboard />;
      case "reports":
        return <PlayerReports />;
      case "assessment":
        return <Assessment />;
      case "daily":
        return <DailyPlan />;
      default:
        return <Dashboard />;
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
        <ExportReport>
          <Button variant="outline" size="sm" className="shadow-card bg-card">
            <FileText size={16} className="mr-2" />
            Export
          </Button>
        </ExportReport>
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
