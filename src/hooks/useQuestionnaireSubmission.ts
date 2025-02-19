
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

  const handleSubmit = async (answers: Record<string | number, string | string[]>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "No user found",
          variant: "destructive",
        });
        return;
      }

      // Convert all answers to strings
      const processedAnswers: SubmissionAnswers = {};
      Object.entries(answers).forEach(([key, value]) => {
        processedAnswers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      });

      const { data: project, error: projectError } = await supabase
        .from('user_projects')
        .insert([
          {
            user_id: user.id,
            status: 'draft',
            ...processedAnswers
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      if (!project) {
        throw new Error('Failed to create project');
      }

      navigate(`/project/${project.id}`);
      return project.id;
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
