
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocationState {
  appIdea: string;
}

const Questionnaire = () => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { appIdea } = location.state as LocationState;

  useEffect(() => {
    const generateQuestions = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-questions', {
          body: { appIdea },
        });

        if (error) {
          console.error('Function error:', error);
          throw error;
        }

        if (!data?.questions || !Array.isArray(data.questions)) {
          throw new Error('Invalid response format from question generation');
        }

        setQuestions(data.questions);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to generate questions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateQuestions();
  }, [appIdea, toast]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Validate all questions are answered
      const unansweredQuestions = questions.some((_, index) => !answers[index]?.trim());
      if (unansweredQuestions) {
        toast({
          title: "Error",
          description: "Please answer all questions before submitting.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('app_questionnaires')
        .insert({
          user_id: user.id,
          initial_idea: appIdea,
          generated_questions: questions,
          answers: answers,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your responses have been saved.",
      });

      navigate('/projects');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600">Generating questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-6">Tell us more about your app</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question}
                </label>
                <Textarea
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[100px]"
                />
              </div>
            ))}
            
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Submit Answers'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
