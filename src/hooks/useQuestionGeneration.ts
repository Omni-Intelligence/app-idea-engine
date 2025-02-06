
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { DynamicQuestion } from '@/store/questionStore';

export const useQuestionGeneration = (setDynamicQuestions: (questions: DynamicQuestion[]) => void) => {
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateQuestions = async (initialIdea: string) => {
    setIsGeneratingQuestions(true);
    try {
      const { data: submission, error: submissionError } = await supabase
        .from('project_submissions')
        .insert([{ 
          initial_idea: initialIdea,
          project_idea: initialIdea,
          target_audience: 'To be determined',
          problem_solved: 'To be determined',
          core_features: 'To be determined',
          ai_integration: 'To be determined',
          monetization: 'To be determined',
          development_timeline: 'To be determined',
          technical_expertise: 'To be determined',
          tech_stack: 'To be determined',
          scaling_expectation: 'To be determined'
        }])
        .select()
        .single();

      if (submissionError) throw submissionError;
      setSubmissionId(submission.id);

      const { error: generateError } = await supabase.functions.invoke('generate-questions', {
        body: { initialIdea, submissionId: submission.id }
      });

      if (generateError) throw generateError;

      const { data: questions, error: fetchError } = await supabase
        .from('dynamic_questions')
        .select('*')
        .eq('submission_id', submission.id)
        .order('order_index');

      if (fetchError) throw fetchError;
      
      const typedQuestions = questions?.map(q => ({
        ...q,
        type: q.type === 'multiple' ? 'multiple' : 'text',
        options: q.options as Array<{ value: string; label: string; }> | undefined
      })) as DynamicQuestion[];
      
      setDynamicQuestions(typedQuestions);
      return submission.id;

    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate project-specific questions. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return {
    generateQuestions,
    isGeneratingQuestions,
    submissionId,
  };
};
