import { Player, PlayerAnswer, PlayerResult, ActionPlanItem, DailyCompletion } from '@/types';
import { defaultQuestions } from './questions';
import { calculateScore, identifyStrengthsAndBlockers } from './scoring';

function generateMockAnswers(bias: 'positive' | 'mixed' | 'negative'): PlayerAnswer[] {
  return defaultQuestions.map(q => {
    let selectedOption: number;
    if (bias === 'positive') {
      selectedOption = q.marks > 0 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2);
    } else if (bias === 'negative') {
      selectedOption = q.marks > 0 ? 2 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
    } else {
      selectedOption = Math.floor(Math.random() * 4);
    }
    return { questionId: q.id, selectedOption };
  });
}

export function initializeMockPlayers(): Player[] {
  const rahulAnswers = generateMockAnswers('mixed');
  const arjunAnswers = generateMockAnswers('positive');
  const vikramAnswers = generateMockAnswers('negative');

  const createResult = (playerId: string, answers: PlayerAnswer[]): PlayerResult => {
    const score = calculateScore(defaultQuestions, answers);
    const { strengths, blockers } = identifyStrengthsAndBlockers(defaultQuestions, answers);
    return {
      playerId,
      answers,
      score,
      strengths,
      blockers,
      timestamp: Date.now()
    };
  };

  return [
    {
      id: 'rahul',
      name: 'Rahul',
      results: createResult('rahul', rahulAnswers)
    },
    {
      id: 'arjun',
      name: 'Arjun',
      results: createResult('arjun', arjunAnswers)
    },
    {
      id: 'vikram',
      name: 'Vikram',
      results: createResult('vikram', vikramAnswers)
    }
  ];
}
 
export const defaultDailyCompletion: DailyCompletion[] = [
  {
    playerId: 'U001',
    date: '2023-10-01',
    items: [
      { itemId: 'affirmation', completed: true },
      { itemId: 'camera', completed: false },
      { itemId: 'breathing', completed: true },
      { itemId: 'visualization', completed: false }
    ]
  },
   {
    playerId: 'U002',
    date: '2023-10-01',
    items: [
      { itemId: 'affirmation', completed: true },
      { itemId: 'camera', completed: false },
      { itemId: 'breathing', completed: true },
      { itemId: 'visualization', completed: false }
    ]
  },
];

export const defaultActionPlan: ActionPlanItem[] = [
  {
    id: 'affirmation',
    title: 'Affirmation Writing',
    description: 'Write positive affirmations morning and night',
    type: 'affirmation'
  },
  {
    id: 'camera',
    title: 'Mirror Talk',
    description: 'Practice positive self-talk in front of mirror',
    type: 'camera'
  },
  {
    id: 'breathing',
    title: 'Breathing Routine',
    description: '4-4-4-4 breathing for 3 minutes',
    type: 'breathing',
    duration: 180
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Visualize success for 5 minutes',
    type: 'visualization',
    duration: 300
  }
];
