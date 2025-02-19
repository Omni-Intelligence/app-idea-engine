
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

      // Create project data with required fields
      const projectData = {
        user_id: user.id,
        title: processedAnswers[0]?.substring(0, 100) || 'Untitled Project', // Use first answer as title or fallback
        description: processedAnswers[0] || null, // Use first answer as description
        status: 'draft' as const,
        project_idea: processedAnswers[0] || null,
        core_features: processedAnswers[1] || null,
        target_audience: processedAnswers[2] || null,
        problem_solved: processedAnswers[3] || null,
        tech_stack: processedAnswers[4] || null,
        development_timeline: processedAnswers[5] || null,
        monetization: processedAnswers[6] || null,
        ai_integration: processedAnswers[7] || null,
        technical_expertise: processedAnswers[8] || null,
        scaling_expectation: processedAnswers[9] || null
      };

      const { data: project, error: projectError } = await supabase
        .from('user_projects')
        .insert(projectData)
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
