
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface SubmissionAnswers {
  [key: string]: string;
}

export const useQuestionnaireSubmission = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (submissionId: string, answers: Record<string | number, string | string[]>) => {
    if (!submissionId) {
      toast({
        title: "Error",
        description: "No submission ID found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert all answers to strings, ensuring arrays are joined with commas
      const processedAnswers: SubmissionAnswers = {};
      Object.entries(answers).forEach(([key, value]) => {
        // Convert number keys to strings
        const stringKey = String(key);
        // Convert array values to comma-separated strings
        processedAnswers[stringKey] = Array.isArray(value) ? value.join(', ') : String(value);
      });

      const { error: updateError } = await supabase
        .from('project_submissions')
        .update({ 
          answers: processedAnswers,
          status: 'completed'
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      navigate(`/analysis/${submissionId}`);
      return submissionId;
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    showConfirmation,
    setShowConfirmation,
    handleSubmit,
  };
};
