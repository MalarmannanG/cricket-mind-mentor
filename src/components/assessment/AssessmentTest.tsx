import { useState } from 'react';
import { Question, PlayerAnswer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';

interface AssessmentTestProps {
  questions: Question[];
  onSubmit: (answers: PlayerAnswer[]) => void;
  existingAnswers?: PlayerAnswer[];
}

export function AssessmentTest({ questions, onSubmit, existingAnswers }: AssessmentTestProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(
    existingAnswers?.reduce((acc, ans) => ({ ...acc, [ans.questionId]: ans.selectedOption }), {}) || {}
  );

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    const playerAnswers: PlayerAnswer[] = questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? 0
    }));
    onSubmit(playerAnswers);
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mental Ability Assessment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Answer all questions honestly. There are no right or wrong answers.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 rounded-lg border bg-card">
                <div className="flex gap-3 mb-3">
                  <span className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="font-medium text-foreground flex-1">{question.text}</p>
                </div>
                
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                  className="ml-11 space-y-2"
                >
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={optIndex.toString()} id={`${question.id}-${optIndex}`} />
                      <Label
                        htmlFor={`${question.id}-${optIndex}`}
                        className="cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {Object.keys(answers).length} of {questions.length} answered
              </span>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!allAnswered}
              size="lg"
            >
              Submit Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
