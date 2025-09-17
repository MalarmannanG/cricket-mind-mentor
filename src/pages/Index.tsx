import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Dashboard } from "@/components/screens/Dashboard";
import { PlayerReports } from "@/components/screens/PlayerReports";
import { Assessment } from "@/components/screens/Assessment";
import { DailyPlan } from "@/components/screens/DailyPlan";
import { ExportReport } from "@/components/ExportReport";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
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

  return (
    <div className="min-h-screen bg-background relative">
      {/* Export Button - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <ExportReport>
          <Button variant="outline" size="sm" className="shadow-card bg-card">
            <FileText size={16} className="mr-2" />
            Export
          </Button>
        </ExportReport>
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

export default Index;
