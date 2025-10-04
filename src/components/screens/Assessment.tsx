// src/components/Assessment.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Award, RotateCcw, LucideIcon } from "lucide-react";
import { toast } from "sonner";

// Firestore API helpers (adjust path if you put API files elsewhere)
import { getQuestionsWithOptions } from "@/api/tests";
import { evaluateAndSaveResult } from "@/api/results";
 


// --- TYPE DEFINITIONS ---

/** Represents a single option for a question. */
interface QuestionOption {
  id: string; // e.g., 'A', 'B'
  text: string;
  mark: number; // The score/mark associated with this choice
  logic?: string; // Explanation for the choice
}

/** Represents a single question with its options. */
interface AssessmentQuestion {
  id: string; // e.g., 'Q1'
  text: string;
  order: number;
  options: QuestionOption[];
}

/** Map of question IDs to the selected option ID. */
type AnswersMap = Record<string, string>; // { [questionId]: optionId }

/** Detailed evaluation for a single question. */
interface PerQuestionEvaluation {
  questionId: string;
  optionId: string;
  mark: number; // Score obtained for this question
  logic?: string; // Reason/logic returned from evaluation
}

/** Overall assessment evaluation result. */
interface AssessmentEvaluation {
  rawScore: number;
  maxScore: number;
  percent: number;
  perQuestion: PerQuestionEvaluation[];
}

/** Props for the Assessment component. */
interface AssessmentProps {
  testId?: string; // default 'Quarter1_Assessment'
  playerId?: string; // default 'U001' (replace with auth uid in real app)
}

// --- COMPONENT START ---

export const Assessment = ({ testId = "Test002", playerId = "U001" }: AssessmentProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]); // Array of typed questions
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null); // 'A' | 'B' | ... or null
  const [answersMap, setAnswersMap] = useState<AnswersMap>({}); // Typed answers map
  const [showResults, setShowResults] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AssessmentEvaluation | null>(null); // Typed evaluation object or null
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Explicitly type the result from the API call
        const qs: AssessmentQuestion[] = await getQuestionsWithOptions(testId);
        if (!mounted) return;
        setQuestions(qs || []);
      } catch (err) {
        console.error("Failed to load questions:", err);
        // Type assertion for error is often needed for dynamic errors
        setError(`Failed to load questions: ${err instanceof Error ? err.message : String(err)}`);
        toast.error("Failed to load questions from Firestore");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [testId]);

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
      // Call API which evaluates and persists the result
      // Assuming evaluateAndSaveResult returns { id: string, evaluation: AssessmentEvaluation }
      const res: { id: string, evaluation: AssessmentEvaluation } = await evaluateAndSaveResult(testId, playerId, answersPayload);
      // API returns { id, evaluation }
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

  function handleReset(): void {
    setCurrentIndex(0);
    setAnswersMap({});
    setSelectedOptionId(null);
    setShowResults(false);
    setEvaluation(null);
  }

  // Define the structure for the score category result
  interface ScoreCategory {
    label: string;
    color: string;
    icon: LucideIcon; // Use LucideIcon type for the icon component
  }

  // Helpers to compute UI values when evaluation exists
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading assessment…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">Error: {error}</div>
      </div>
    );
  }

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
                      <div className="text-sm font-semibold">{q?.order}. {q?.text}</div>
                      {/* Optional chaining is crucial here because q and chosenOpt might be undefined */}
                      <div className="text-sm mt-1">Selected: <strong>{chosenOpt?.id}</strong> — {chosenOpt?.text}</div>
                      <div className="text-xs opacity-80 mt-1">Mark: {pq.mark} • Reason: {pq.logic ?? chosenOpt?.logic}</div>
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

  // Render the current question
  const currentQuestion: AssessmentQuestion | undefined = questions[currentIndex];
  const progress: number = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-field bg-clip-text text-transparent">
          Mental Assessment
        </h1>
        <p className="text-muted-foreground mt-2">Cricket Psychology Evaluation</p>
      </div>

      {/* Progress */}
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
            {currentQuestion?.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Optional chaining ensures mapping only happens if options exists */}
          {currentQuestion?.options?.map((opt: QuestionOption) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedOptionId === opt.id
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
    </div>
  );
};

export default Assessment;