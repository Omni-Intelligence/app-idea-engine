
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { DynamicQuestion } from '@/store/questionStore';

export const useQuestionGeneration = (setDynamicQuestions: (questions: DynamicQuestion[]) => void) => {
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const { toast } = useToast();

  const generateQuestions = async (initialIdea: string) => {
    setIsGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: { initialIdea }
      });

      if (error) throw error;
      
      if (!data || !data.questions) {
        throw new Error('No questions received from the server');
      }

      const typedQuestions = data.questions.map((q: any) => ({
        ...q,
        type: 'text',
        options: undefined
      })) as DynamicQuestion[];
      
      setDynamicQuestions(typedQuestions);
      return true;

    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate project-specific questions. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return {
    generateQuestions,
    isGeneratingQuestions
  };
};
