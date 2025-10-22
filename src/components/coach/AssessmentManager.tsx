import { useEffect, useState } from 'react';
import { Assessments, Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { defaultQuestions } from '@/utils/questions';
import { createQuestion, getAllQuestions, removeQuestion } from '@/api/questions';
import { useAuth } from '@/contexts/AuthContext';

interface AssessmentManagerProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function AssessmentManager() {
  const { setLoading } = useAuth();
  const [questions, setQuestions] = useState<Assessments[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Assessments>({
    question: '',
    options: [
      { text: '', mark: 0, logic: '', id: String.fromCharCode(65 + 0) },
    ],
    order: questions.length + 1,
  });
  useEffect(() => {
    setLoading(true);
    getAllQuestions().then((fetchedQuestions) => {
      console.log('Fetched questions:', fetchedQuestions);
      setQuestions(fetchedQuestions);
    }).finally(() => {
      setLoading(false);
    });
  }, []);
  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in question text and category",
        variant: "destructive"
      });
      return;
    }
    if (newQuestion.options.some(opt => !opt.text.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill in all 4 options",
        variant: "destructive"
      });
      return;
    }

    const question: Assessments = {
      question: newQuestion.question.trim(),
      options: newQuestion.options,
      order: questions.length + 1,
    };

    setQuestions([...questions, question]);
    createQuestion(question).then((res: any) => {
      toast({
        title: "Question Added",
        description: "New question has been added to the assessment"
      });
      setNewQuestion({
        question: '',
        options: [
          { text: '', mark: 0, logic: '', id: String.fromCharCode(65 + 0) },
        ],
        order: questions.length + 1,
      });
    }).catch(err => {
      toast({
        title: "Add Question failed",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    });
    setShowAddForm(false);
  };

  const handleRemoveQuestion = (questionId: string) => {
    removeQuestion(questionId).then(() => {
      setQuestions(questions.filter(q => q.id !== questionId));
      toast({
        title: "Question Removed",
        description: "Question has been removed from the assessment"
      });
    }).catch(err => {
    });
  };
  const addNewOption = () => {

    newQuestion.options.push({ text: '', mark: 0, logic: '', id: String.fromCharCode(65 + newQuestion.options.length) });
    setNewQuestion({ ...newQuestion });
  }


  return (
    <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assessment Questions</CardTitle>
              <CardDescription>
                Manage the questions for the mental ability assessment
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              {showAddForm ? 'Cancel' : 'Add Question'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">New Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-text">Question Text</Label>
                  <Input
                    id="question-text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Enter the question text"
                  />
                </div>
                {newQuestion.options.map((option, index) => (
                  <>
                    <Label>Option {String.fromCharCode(65 + index)}</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`option-text-${index}`}>Option Text</Label>
                        <Input
                          id={`option-text-${index}`}
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index].text = e.target.value;
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }}
                          placeholder={`Enter text for option ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`option-text-${index}`}>Category</Label>
                        <Input
                          id={`option-text-${index}`}
                          value={option.logic}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index].logic = e.target.value;
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }}
                          placeholder={`Enter Category for option`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`option-text-${index}`}>Mark</Label>
                        <Input
                          id={`option-text-${index}`}
                          value={option.mark}
                          type='number'
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index].mark = parseInt(e.target.value);
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }}
                          placeholder={`Enter mark for option`}
                        />
                      </div>
                    </div>
                  </>
                ))}
                <Button onClick={addNewOption} className="w-1/2 text-regal-blue bg-secondary hover:bg-secondary/80 gap-2 float-right">
                  Add Option
                </Button>
                <Button onClick={handleAddQuestion} className="w-full">
                  Add Question
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Current Questions ({questions.length})
              </h3>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-4" style={{ justifyContent: 'space-between' }}>
                        <p className="font-medium text-foreground">{question.question}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="flex-shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} style={{ boxShadow: '0 3px 3px -2px rgba(0, 0, 0, 0.1)', padding: '10px 0px 10px 0px' }}>
                            <div key={optIndex} className="text-sm text-muted-foreground pl-">
                              <span className='font-medium'>{String.fromCharCode(65 + optIndex)}</span>. {option.text}
                            </div>
                            <div className="text-sm text-muted-foreground pl-" style={{ justifyContent: 'space-between', display: 'flex', paddingRight: '1rem' }}>
                              <span className="text-muted-foreground">
                                <span className='font-medium'>Category</span>: <span className="text-sm text-muted-foreground">{option.logic}</span>
                              </span>
                              <span className="text-muted-foreground">
                                <span className={`font-medium ${option.mark > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {option.mark > 0 ? '+' : ''}{option.mark}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>


                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
