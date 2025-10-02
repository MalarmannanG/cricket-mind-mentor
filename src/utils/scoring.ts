import { Question, PlayerAnswer } from '@/types';

export function calculateScore(questions: Question[], answers: PlayerAnswer[]): number {
  return answers.reduce((total, answer) => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return total;
    
    const markValue = question.marks;
    // For positive marks (2), index 0 = full marks, 1 = 2/3, 2 = 1/3, 3 = 0
    // For negative marks, index 0 = 0, increasing index = more negative
    if (markValue > 0) {
      const fraction = [1, 0.67, 0.33, 0][answer.selectedOption] || 0;
      return total + (markValue * fraction);
    } else {
      const multiplier = [0, 0.33, 0.67, 1][answer.selectedOption] || 0;
      return total + (markValue * multiplier);
    }
  }, 0);
}

export function identifyStrengthsAndBlockers(
  questions: Question[],
  answers: PlayerAnswer[]
): { strengths: string[]; blockers: string[] } {
  const categoryScores: Record<string, { score: number; count: number }> = {};

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return;

    if (!categoryScores[question.category]) {
      categoryScores[question.category] = { score: 0, count: 0 };
    }

    const markValue = question.marks;
    let points = 0;
    
    if (markValue > 0) {
      const fraction = [1, 0.67, 0.33, 0][answer.selectedOption] || 0;
      points = markValue * fraction;
    } else {
      const multiplier = [0, 0.33, 0.67, 1][answer.selectedOption] || 0;
      points = markValue * multiplier;
    }

    categoryScores[question.category].score += points;
    categoryScores[question.category].count += 1;
  });

  const categories = Object.entries(categoryScores).map(([category, data]) => ({
    category,
    average: data.score / data.count
  }));

  categories.sort((a, b) => b.average - a.average);

  const strengths = categories.slice(0, 3).map(c => c.category);
  const blockers = categories.slice(-5).reverse().map(c => c.category);

  return { strengths, blockers };
}

export function getPerformanceLabel(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Average';
  return 'Needs Improvement';
}
