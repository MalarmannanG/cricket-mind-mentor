import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Award, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const mockQuestions = [
  {
    id: 1,
    question: "How do you typically handle pressure during a crucial match situation?",
    options: [
      "I stay calm and focused on the process",
      "I feel nervous but try to push through",
      "I get overwhelmed and my performance suffers",
      "I avoid thinking about the pressure"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "When you make a mistake during play, what's your immediate response?",
    options: [
      "I quickly forget it and focus on the next ball",
      "I analyze what went wrong briefly then move on",
      "I keep thinking about it for several balls",
      "I get frustrated and it affects my next few plays"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "How do you prepare mentally before going out to bat?",
    options: [
      "I visualize successful shots and positive outcomes",
      "I review the match situation and strategy",
      "I try not to think too much about it",
      "I worry about various things that could go wrong"
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "During a poor performance, how do you maintain motivation?",
    options: [
      "I remind myself of past successes and keep trying",
      "I focus on small improvements rather than the big picture",
      "I find it difficult but keep playing",
      "I lose confidence and struggle to perform"
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "How do you deal with criticism from coaches or teammates?",
    options: [
      "I listen carefully and use it to improve",
      "I accept it but sometimes feel hurt",
      "I take it personally and get defensive",
      "I ignore it completely"
    ],
    correctAnswer: 0
  },
  // Adding 15 more questions to reach 20 total
  {
    id: 6,
    question: "When facing a very aggressive fast bowler, what's your mental approach?",
    options: [
      "I stay composed and wait for my opportunities",
      "I feel intimidated but try to cope",
      "I become overly aggressive in response",
      "I lose confidence and play defensively"
    ],
    correctAnswer: 0
  },
  {
    id: 7,
    question: "How do you handle crowd noise during important matches?",
    options: [
      "I use it as energy and motivation",
      "I try to block it out and focus",
      "It distracts me but I manage",
      "It makes me nervous and affects my game"
    ],
    correctAnswer: 0
  },
  {
    id: 8,
    question: "What's your approach when your team is in a difficult situation?",
    options: [
      "I take extra responsibility and try to lead",
      "I stick to my role and do my best",
      "I feel the pressure but continue playing",
      "I worry about letting the team down"
    ],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "How do you maintain concentration during long batting sessions?",
    options: [
      "I break it down into small goals and stay present",
      "I remind myself of the importance of each ball",
      "I struggle but try to keep going",
      "I find my mind wandering often"
    ],
    correctAnswer: 0
  },
  {
    id: 10,
    question: "When you're not selected for an important match, how do you respond?",
    options: [
      "I use it as motivation to work harder",
      "I'm disappointed but accept the decision",
      "I feel dejected but eventually get over it",
      "I lose confidence in my abilities"
    ],
    correctAnswer: 0
  },
  {
    id: 11,
    question: "How do you handle success and praise after a good performance?",
    options: [
      "I appreciate it but stay focused on improvement",
      "I enjoy it but don't let it get to my head",
      "I feel good but worry about maintaining the level",
      "I become overconfident for the next game"
    ],
    correctAnswer: 0
  },
  {
    id: 12,
    question: "What's your mental state during practice sessions?",
    options: [
      "I'm fully focused and treat each ball seriously",
      "I'm mostly focused but sometimes relaxed",
      "I go through the motions but lack intensity",
      "I'm often distracted and not fully present"
    ],
    correctAnswer: 0
  },
  {
    id: 13,
    question: "How do you deal with umpiring decisions that go against you?",
    options: [
      "I accept them and move on immediately",
      "I'm frustrated but control my emotions",
      "I show my displeasure but continue playing",
      "I get very upset and it affects my game"
    ],
    correctAnswer: 0
  },
  {
    id: 14,
    question: "When facing spin bowling on a turning pitch, what's your mindset?",
    options: [
      "I see it as a challenge and adapt my technique",
      "I'm cautious but confident in my ability",
      "I feel uncertain but try my best",
      "I'm worried about getting out"
    ],
    correctAnswer: 0
  },
  {
    id: 15,
    question: "How do you prepare for matches against stronger opposition?",
    options: [
      "I see it as an opportunity to test myself",
      "I prepare extra hard and stay positive",
      "I'm nervous but try to stay confident",
      "I'm intimidated by their reputation"
    ],
    correctAnswer: 0
  },
  {
    id: 16,
    question: "What's your approach when you're the last recognized batsman?",
    options: [
      "I embrace the responsibility and play positively",
      "I'm nervous but determined to contribute",
      "I feel the pressure but try to cope",
      "I'm overwhelmed by the expectations"
    ],
    correctAnswer: 0
  },
  {
    id: 17,
    question: "How do you handle teammates who are negative or discouraging?",
    options: [
      "I stay positive and try to lift the team mood",
      "I focus on my own game and ignore negativity",
      "I'm affected but try to stay motivated",
      "Their negativity brings down my confidence"
    ],
    correctAnswer: 0
  },
  {
    id: 18,
    question: "When you're having a bad day with the bat, how do you respond?",
    options: [
      "I work on my technique and mental approach",
      "I analyze what's going wrong and adjust",
      "I hope things will improve in the next game",
      "I lose confidence and doubt my abilities"
    ],
    correctAnswer: 0
  },
  {
    id: 19,
    question: "How do you maintain focus when not directly involved in play?",
    options: [
      "I actively support teammates and study the game",
      "I try to stay engaged but sometimes zone out",
      "I'm somewhat distracted but present",
      "I often lose focus and think about other things"
    ],
    correctAnswer: 0
  },
  {
    id: 20,
    question: "What's your mindset when chasing a challenging target?",
    options: [
      "I'm excited by the challenge and believe we can do it",
      "I'm determined but realistic about the difficulty",
      "I'm hopeful but worried about the pressure",
      "I'm pessimistic about our chances"
    ],
    correctAnswer: 0
  }
];

export const Assessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      
      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
        toast.success("Assessment completed!");
      }
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedAnswer(null);
  };

  const calculateScore = () => {
    const correctAnswers = answers.filter((answer, index) => 
      answer === mockQuestions[index].correctAnswer
    ).length;
    return Math.round((correctAnswers / mockQuestions.length) * 100);
  };

  const getScoreCategory = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-success", icon: Award };
    if (score >= 60) return { label: "Good", color: "bg-primary", icon: CheckCircle };
    if (score >= 40) return { label: "Fair", color: "bg-warning", icon: CheckCircle };
    return { label: "Needs Improvement", color: "bg-destructive", icon: XCircle };
  };

  if (showResults) {
    const score = calculateScore();
    const category = getScoreCategory(score);
    const CategoryIcon = category.icon;

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
              You answered {answers.filter((answer, index) => answer === mockQuestions[index].correctAnswer).length} out of {mockQuestions.length} questions correctly
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
                  {answers.filter((answer, index) => answer === mockQuestions[index].correctAnswer).length}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">
                  {mockQuestions.length - answers.filter((answer, index) => answer === mockQuestions[index].correctAnswer).length}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mental Resilience Score</span>
                <span>{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={resetAssessment}
          className="w-full bg-gradient-field hover:opacity-90 transition-all"
        >
          <RotateCcw size={16} className="mr-2" />
          Retake Assessment
        </Button>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
  const question = mockQuestions[currentQuestion];

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
            <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Badge 
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className="mt-0.5"
                >
                  {String.fromCharCode(65 + index)}
                </Badge>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Next Button */}
      <Button 
        onClick={nextQuestion}
        disabled={selectedAnswer === null}
        className="w-full bg-gradient-field hover:opacity-90 transition-all disabled:opacity-50"
      >
        {currentQuestion === mockQuestions.length - 1 ? "Complete Assessment" : "Next Question"}
      </Button>
    </div>
  );
};