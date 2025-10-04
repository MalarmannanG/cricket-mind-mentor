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
  score: number;
  strengths: string[];
  blockers: string[];
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  results?: PlayerResult;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  type: 'affirmation' | 'camera' | 'breathing' | 'visualization';
  duration?: number;
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
