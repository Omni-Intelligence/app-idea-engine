
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

  const handleSubmit = async (answers: Record<string | number, string | string[]>, questions: string[]) => {
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

      // Process the first answer as the project idea/title
      const firstAnswer = Array.isArray(answers[0]) ? answers[0].join(', ') : String(answers[0]);

      // Create the project first
      const { data: project, error: projectError } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          title: firstAnswer.substring(0, 100),
          description: firstAnswer,
          project_idea: firstAnswer,
          status: 'draft'
        })
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('Failed to create project');

      // Create questionnaire responses
      const questionResponses = questions.map((question, index) => ({
        project_id: project.id,
        question,
        answer: Array.isArray(answers[index]) 
          ? answers[index].join(', ') 
          : String(answers[index] || ''),
        question_order: index
      }));

      const { error: responsesError } = await supabase
        .from('questionnaire_responses')
        .insert(questionResponses);

      if (responsesError) throw responsesError;

      toast({
        title: "Success",
        description: "Project created successfully!",
      });

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
