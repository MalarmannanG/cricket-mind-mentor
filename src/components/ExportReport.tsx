import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trophy, Target, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AssessmentEvaluation, IPlayers } from "@/types";

interface ExportReportProps {
  playerResult: AssessmentEvaluation | null;
  children: React.ReactNode | any;
  player: IPlayers | null;
}

export const ExportReport = ({ children, player, playerResult }: ExportReportProps) => {
  const [playerData, setPlayerData] = useState<{
    strengths: string[];
    blockers: string[];
    coachNotes : string;
  } | null>({
    strengths: playerResult?.perQuestion?.filter(a => a.mark > 0).map(a => a.logic).slice(0, 5) || [],
    blockers: playerResult?.perQuestion?.filter(a => a.mark < 0).map(a => a.logic).slice(0, 5) || [],
    coachNotes: playerResult?.coachNotes ?? ''
  });
  const generateReport = () => {
    let strengths = '';
    playerData && playerData?.strengths.map((strength, index) => {
      strengths += `<div key=${index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                      ${index + 1}.
                    </Badge>
                    <span className="text-sm">${strength}</span>
                  </div>`;
    })
    let blockers = '';
    playerData && playerData?.blockers.map((blocker, index) => {
      blockers += `<div key=${index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                      ${index + 1}.
                    </Badge>
                    <span className="text-sm">${blocker}</span>
                  </div>`;
    })
    // Create a styled HTML content for the report
    const reportHTML = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>G-MainScan Report – ${player?.name}</title>
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      color: #1a1a1a;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    .page1 {
      max-width: 800px;
      margin: 40px auto;
      background: #ffffff;
      padding: 40px 50px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      page-break-before: always;
      page-break-after: always;
    }

    h1, h2, h3 {
      color: #0f172a;
      margin:0px;
	  padding:0px;
	  text-align: center;
    }

    h1 {
      font-size: 1.8rem;
      
    }

    h2 {
      color: #2563eb;
       
    }

    p {
      margin-bottom: 12px;
    }

    b {
      color: #111827;
    }

    .quote {
      font-style: italic;
      color: #475569;
      background: #f1f5f9;
      padding: 12px 16px;
      border-left: 4px solid #2563eb;
      border-radius: 6px;
      margin: 20px 0;
    }

    ul {
      margin: 10px 0 20px 20px;
    }

    li {
      margin-bottom: 6px;
    }

    .section-title {
	color: #2563eb;
    padding: 8px 0px;
    border-radius: 6px;
    font-weight: 900;
    font-size: 24px;
    margin: 25px 0 3px;
    display: inline-block;
    }

    .highlight {
      color: #2563eb;
      font-weight: bold;
    }

    footer {
      text-align: center;
      font-size: 0.9rem;
      margin-top: 30px;
      color: #6b7280;
    }

    @media print {
      body {
        background: white;
      }
      .page {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="page">
    <h1>G-MainScan</h1>
	  <h2>G-MainScan Mental Performance Report</h2>
    <p><b>Name:</b> ${player.name}<br>
    <b>Date:</b> ${playerResult.createdAt.toDate().toLocaleDateString('en-GB')}</p>

    <div class="quote">
      “Remember, champions are not born. They are trained, tested, and built — step by step. Keep growing stronger.”
    </div>

    <p>
      <span class="section-title">Welcome to Your G-MainScan Report</span><br>
      This report is designed to help you <b>grow, not to judge you</b>.
      It highlights your <b>top strengths — your mental superpowers —</b> and gently shows patterns that can be upgraded.
    </p>

    <p>These are not problems, but opportunities to build focus, patience, and resilience.</p>
    <p>Every elite athlete has internal patterns. The great ones learn to understand, manage, and rise above them. This is your tool to do that.</p>

    <ul>
      <li>Keep this report private unless you choose to share it with your coach or mentor.</li>
      <li>Use the affirmation daily.</li>
      <li>Follow one small action at a time.</li>
      <li><b>Remember:</b> You are capable of anything.</li>
    </ul>

    <p class="section-title">Top ${playerData?.strengths.length > 0 ? playerData?.strengths.length : ''} Strengths</p><br/>
     ${strengths}
  </div>
 
  <div class="page">
     <p class="section-title">Top ${playerData?.blockers.length > 0 ? playerData?.blockers.length : ''} Blockers</p><br/>
     ${blockers}

    <p class="section-title">Action Plan</p>
    <p><b>Affirmation Writing:</b><br>
    “I trust my training. Every mistake makes me stronger, every challenge makes me sharper.”<br>
    ✍️ Morning: Write it 5 times<br>
    ✍️ Night: Write it 3 times
    </p>

    <p><b>Mirror Talk (Affirmation):</b> Stand in front of a mirror, look into your own eyes, and say the affirmation out loud with confidence and a smile.<br>
    Morning once, Night once — add emotion and belief as if you already own it.</p>

    <p><b>Breathing Routine (3 minutes):</b> Practice <span class="highlight">4-4-4-4 Box Breathing</span> for 3 minutes before pressure moments.<br>
    Inhale 4s → Hold 4s → Exhale 4s → Hold 4s</p>

    <p><b>Visualization (5 minutes):</b> Spend 5 minutes daily imagining yourself calmly resetting after a mistake, smiling, and executing the next move with energy and focus.</p>

    <p class="section-title">Coach’s Notes</p><br/>
     ${playerData.coachNotes}
  </div>
 
  <div class="page">
    <p class="section-title">Training Drills & Mindset Practices</p>
    <ul>
      <li><b>Fear of Failure & Pressure Sensitivity:</b> Penalty shootouts under time pressure + 3-min breathing.</li>
      <li><b>Self-Doubt & Comparison Trap:</b> Journal 3 personal wins daily.</li>
      <li><b>Overthinking Mistakes:</b> Add “Reset Drills” (clap + reset + continue).</li>
      <li><b>Emotional Frustration with Teammates:</b> Pair drills to build patience and trust.</li>
    </ul>

    <p><b>Personal Motivation & Closing Remark:</b><br>
      “Maahath, your ability to bounce back and your hunger to grow make you stand out. Believe in your training, trust your instincts, and play with joy. Champions are built one step, one game, one mindset shift at a time.”
    </p>

    <p class="section-title">Parent & Coach Support</p>
    <p><b>Parents:</b> Encourage affirmations, breathing, and daily mindset routines.<br>
    <b>Coaches:</b> Provide pressure drills and teamwork exercises to strengthen confidence and resilience.</p>

    <footer>
      <p style="text-align:left;"><b>Assessed by:</b> Gnanamani Kannaiyan<br>Performance Mentor</p>
    </footer>
  </div>

</body>
</html>
    `;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(reportHTML);
      newWindow.print();
    }

  };
useEffect(()=>{
  setPlayerData({
    strengths: playerResult?.perQuestion?.filter(a => a.mark > 0).map(a => a.logic).slice(0, 5) || [],
    blockers: playerResult?.perQuestion?.filter(a => a.mark < 0).map(a => a.logic).slice(0, 5) || [],
    coachNotes: playerResult?.coachNotes ?? ''
  });
},[playerResult])
  return (
    <div>
      {React.cloneElement(children, { onClick: generateReport })}
    </div>
    // <div className="space-y-4">
    //   {children}
    // </div>
  );
};