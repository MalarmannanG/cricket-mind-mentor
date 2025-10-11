import { useEffect, useState } from 'react';
import { Question, PlayerAnswer, Assessments, IOptions, AssessmentEvaluation, ScoreCategory, PerQuestionEvaluation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Award, CheckCircle, CheckCircle2, LucideIcon, RotateCcw, XCircle } from 'lucide-react';
import { getAllQuestions } from '@/api/questions';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { evaluateAndSaveResult } from '@/api/assessmentResult';
import { useAuth } from '@/contexts/AuthContext';
import { listResultsByPlayer } from '@/api/results';

interface AssessmentTestProps {
  questions: Question[];
  onSubmit: (answers: PlayerAnswer[]) => void;
  existingAnswers?: PlayerAnswer[];
}
/** Map of question IDs to the selected option ID. */
type AnswersMap = Record<string, string>; // { [questionId]: optionId }

export function AssessmentTest() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Assessments[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null); // 'A' | 'B' | ... or null
  const [answersMap, setAnswersMap] = useState<AnswersMap>({}); // Typed answers map
  const [showResults, setShowResults] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AssessmentEvaluation | null>(null); // Typed evaluation object or null
  const [saving, setSaving] = useState<boolean>(false);
  const [assessmentId, setAssessmentId] = useState<string>(null);

  const positiveCount: number = evaluation
    ? evaluation.perQuestion.filter(p => p.mark > 0).length
    : 0;
  const negativeCount: number = evaluation
    ? evaluation.perQuestion.filter(p => p.mark <= 0).length
    : 0;

  function getScoreCategory(score: number): ScoreCategory {
    if (score >= 80) return { label: "Excellent", color: "bg-success", icon: Award };
    if (score >= 60) return { label: "Good", color: "bg-primary", icon: CheckCircle };
    if (score >= 40) return { label: "Fair", color: "bg-warning", icon: CheckCircle };
    return { label: "Needs Improvement", color: "bg-destructive", icon: XCircle };
  }



  const currentQuestion: Assessments | undefined = questions[currentIndex];
  const progress: number = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  function handleSelect(optionId: string): void {
    setSelectedOptionId(optionId);
  }

  async function handleNext(): Promise<void> {
    const q = questions[currentIndex];
    if (!q) return;
    if (selectedOptionId == null) {
      toast.error("Please select an answer");
      return;
    }

    // Prepare a local answers map including this selection
    const newAnswers: AnswersMap = { ...answersMap, [q.id]: selectedOptionId };
    setAnswersMap(newAnswers);

    // move to next or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // set selectedOptionId to whatever previous answer existed for next question, or null
      const nextQ = questions[currentIndex + 1];
      // Use the typed answers map for lookup
      setSelectedOptionId(newAnswers[nextQ?.id] ?? null);
    } else {
      // last question -> submit
      await submitAndSave(newAnswers);
    }
  }

  async function submitAndSave(answersPayload: AnswersMap): Promise<void> {
    setSaving(true);
    try {
      const res: { id: string, evaluation: AssessmentEvaluation } = await evaluateAndSaveResult(user.id, answersPayload, assessmentId);
      setEvaluation(res.evaluation ?? null);
      setShowResults(true);
      toast.success("Assessment completed and saved.");
    } catch (err) {
      console.error("Error saving result:", err);
      toast.error("Error saving result");
    } finally {
      setSaving(false);
    }
  }
  async function handleReset(): Promise<void> {
    setCurrentIndex(0);
    setAnswersMap({});
    setSelectedOptionId(null);
    setShowResults(false);
    setEvaluation(null);
    await fetchQuestions();
  }
  async function fetchQuestions() {
    setLoading(true);
    try {
      const qs: Assessments[] = await getAllQuestions();
      setQuestions(qs);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Error fetching questions");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    async function fetchTestResult() {
      setLoading(true);
      try {
        const qs: any[] = await listResultsByPlayer(user?.id);
        if (qs.length > 0 && qs[0].perQuestion.length > 0) {
          const latest = qs[0];
          setAssessmentId(latest.id);
          //const perQuestion: PerQuestionEvaluation[] = latest.answer || [];
          setEvaluation(latest);
          setShowResults(true);
          setTestResult(qs);
        }
        else {
          await fetchQuestions();
        }

      } catch (err) {
        console.error("Error fetching questions:", err);
        toast.error("Error fetching questions");
      } finally {
        setLoading(false);
      }
    }

    fetchTestResult();
  }, [user]);
  // Show results screen
  if (showResults && evaluation) {
    const score: number = evaluation.percent;
    const category: ScoreCategory = getScoreCategory(score);
    const CategoryIcon: LucideIcon = category.icon; // Explicitly typed

    return (
      <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-field bg-clip-text text-transparent">
            Assessment Results
          </h1>
        </div>

        <Card className="shadow-elevated border-0 bg-gradient-sky text-white">
          <CardContent className="pt-6 text-center space-y-4">
            <CategoryIcon size={48} className="mx-auto animate-bounce-in" />
            <div>
              <div className="text-4xl font-bold">{score}%</div>
              <div className="text-lg opacity-90">{category.label}</div>
            </div>
            <div className="text-sm opacity-80">
              You scored {evaluation.rawScore} out of {evaluation.maxScore} (raw/max)
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-success/10">
                <div className="text-2xl font-bold text-success">
                  {positiveCount}
                </div>
                <div className="text-sm text-muted-foreground">Positive Picks</div>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">
                  {negativeCount}
                </div>
                <div className="text-sm text-muted-foreground">Negative Picks</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mental Resilience Score</span>
                <span>{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Per question summary</h4>
              <div className="space-y-3">
                {evaluation.perQuestion.map((pq: PerQuestionEvaluation) => {
                  // find question and chosen option text
                  const q = questions.find(x => x.id === pq.questionId);
                  const chosenOpt = q?.options?.find(o => o.id === pq.optionId);
                  return (
                    <div key={pq.questionId} className="p-3 border rounded">
                      <div className="text-sm font-semibold">{pq?.questionText}</div>
                      {/* Optional chaining is crucial here because q and chosenOpt might be undefined */}
                      <div className="text-sm mt-1">Selected: <strong>{pq?.optionId}</strong> — {pq?.optionText}</div>
                      <div className="text-xs opacity-80 mt-1">Mark: {pq.mark} • Reason: {pq.logic ?? pq.logic}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </CardContent>
        </Card>

        <Button
          onClick={handleReset}
          className="w-full bg-gradient-field hover:opacity-90 transition-all"
        >
          <RotateCcw size={16} className="mr-2" />
          Retake Assessment
        </Button>
      </div>
    );
  }
  return (
    <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-field bg-clip-text text-transparent">
          Mental Assessment
        </h1>
        <p className="text-muted-foreground mt-2">Cricket Psychology Evaluation</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion?.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Optional chaining ensures mapping only happens if options exists */}
          {currentQuestion?.options?.map((opt: IOptions) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${selectedOptionId === opt.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
            >
              <div className="flex items-start gap-3">
                <Badge
                  variant={selectedOptionId === opt.id ? "default" : "outline"}
                  className="mt-0.5"
                >
                  {opt.id}
                </Badge>
                <span className="flex-1">{opt.text}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={selectedOptionId === null || saving}
        className="w-full bg-gradient-field hover:opacity-90 transition-all disabled:opacity-50"
      >
        {currentIndex === questions.length - 1 ? (saving ? "Saving..." : "Complete Assessment") : "Next Question"}
      </Button>

      {/* <Card>
        <CardHeader>
          <CardTitle>Mental Ability Assessment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Answer all questions honestly. There are no right or wrong answers.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((item, index) => (
              <div key={item.id} className="p-4 rounded-lg border bg-card">
                <div className="flex gap-3 mb-3">
                  <span className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="font-medium text-foreground flex-1">{item.question}</p>
                </div>
                
                <RadioGroup
                  value={answers[item.id]?.toString()}
                  onValueChange={(value) => handleAnswerChange(item.id, parseInt(value))}
                  className="ml-11 space-y-2"
                >
                  {item.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={optIndex.toString()} id={`${item.id}-${optIndex}`} />
                      <Label
                        htmlFor={`${item.id}-${optIndex}`}
                        className="cursor-pointer flex-1"
                      >
                        {option.text}
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
      </Card> */}
    </div>
  );
}
