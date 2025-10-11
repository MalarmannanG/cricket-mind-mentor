import { LucideIcon } from "lucide-react";

export interface Question {
  id: string;
  text: string;
  options: string[];
  marks: number;
  category: string;
}
export interface Assessments {
  id?: string;
  question: string;
  options: IOptions[];
  order : number;
}

export interface IOptions {
  id:string;
  logic: string;
  mark: number;
  text: string;
}

export interface PlayerAnswer {
  questionId: string;
  selectedOption: number;
}

export interface PlayerResult {
  playerId: string;
  answers: PlayerAnswer[];
  rawScore: number;
  strengths: string[];  
  blockers: string[];
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'coach';
  results?: AssessmentEvaluation;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  type: 'affirmation' | 'camera' | 'breathing' | 'visualization';
  duration?: number;
}
export interface ActionPlanStatus extends ActionPlanItem {
   completed: boolean;
}
export interface DailyCompletion {
  playerId: string;
  date: string;
  items: {
    itemId: string;
    completed: boolean;
    timestamp?: number;
    data?: string;
  }[];
}

export interface CoachNote {
  playerId: string;
  note: string;
  timestamp: number;
}


export interface PerQuestionEvaluation {
  questionId: string;
  optionId: string;
  mark: number; // Score obtained for this question
  logic?: string; // Reason/logic returned from evaluation
  optionText: string;
  questionText: string;
}

export interface IPlayers {
  name: string;
  id: string;
}

/** Overall assessment evaluation result. */
 export interface AssessmentEvaluation {
  id: string | null;
  rawScore: number;
  maxScore: number;
  percent: number;
  perQuestion: PerQuestionEvaluation[];
  createdAt : any
  coachNotes:any;
}
export interface QuestionOption {
  id: string; // e.g., 'A', 'B'
  text: string;
  mark: number; // The score/mark associated with this choice
  logic?: string; // Explanation for the choice
}

export interface ScoreCategory {
  label: string;
  color: string;
  icon: LucideIcon; 
}