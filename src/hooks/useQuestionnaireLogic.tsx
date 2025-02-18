
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseQuestionnaireLogicProps {
  appIdea: string | undefined;
  isEditMode: boolean;
  initialQuestions?: string[];
  initialAnswers?: Record<number, string>;
}

export const useQuestionnaireLogic = ({
  appIdea,
  isEditMode,
  initialQuestions,
  initialAnswers,
}: UseQuestionnaireLogicProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingAnswers, setGeneratingAnswers] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!appIdea) {
      toast({
        title: "Error",
        description: "No app idea provided. Please start from the home page.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    if (isEditMode && initialQuestions && initialAnswers) {
      setQuestions(initialQuestions);
      setAnswers(initialAnswers);
      setIsLoading(false);
      return;
    }

    const generateQuestions = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-questions', {
          body: { appIdea },
        });

        if (error) throw error;

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
  }, [appIdea, isEditMode, initialQuestions, initialAnswers, toast, navigate]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const generateAnswer = async (index: number) => {
    setGeneratingAnswers(prev => ({ ...prev, [index]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-answer', {
        body: { 
          appIdea,
          question: questions[index],
        },
      });

      if (error) throw error;

      if (!data?.answer) {
        throw new Error('No answer generated');
      }

      setAnswers(prev => ({ ...prev, [index]: data.answer }));
      
      toast({
        title: "Success",
        description: "AI suggestion generated! Feel free to edit it.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAnswers(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const unansweredQuestions = questions.some((_, index) => !answers[index]?.trim());
      if (unansweredQuestions) {
        toast({
          title: "Error",
          description: "Please answer all questions before submitting.",
          variant: "destructive",
        });
        return;
      }

      navigate('/questionnaire-confirmation', {
        state: {
          appIdea,
          questions,
          answers,
        },
      });
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

  return {
    questions,
    answers,
    isLoading,
    isSaving,
    generatingAnswers,
    handleAnswerChange,
    generateAnswer,
    handleSubmit,
  };
};
