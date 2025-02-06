
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const submitQuestionnaire = async (answers: Record<string, string>) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not signed in, proceed with analysis only
  if (!session) {
    // Just trigger the analysis without storing data
    const { error: analysisError } = await supabase.functions.invoke('analyze-submission', {
      body: { answers }
    });

    if (analysisError) throw analysisError;
    return 'temporary';  // Return a temporary ID for non-authenticated users
  }

  // For authenticated users, store the data and create a project
  const submission = {
    user_id: session.user.id,
    initial_idea: answers.initial || '',
    project_idea: answers[0] || '',
    target_audience: answers[1] || '',
    problem_solved: answers[2] || '',
    core_features: answers[3] || '',
    ai_integration: answers[4] || '',
    monetization: answers[5] || '',
    development_timeline: answers[6] || '',
    technical_expertise: answers[7] || '',
    tech_stack: answers[8] || '',
    scaling_expectation: answers[9] || '',
    answers: answers
  };

  // Create the submission
  const { data: submissionData, error: submissionError } = await supabase
    .from('project_submissions')
    .insert([submission])
    .select()
    .single();

  if (submissionError) throw submissionError;

  // Create a project entry
  const { error: projectError } = await supabase
    .from('user_projects')
    .insert([{
      user_id: session.user.id,
      title: answers.initial || answers[0] || 'Untitled Project',
      description: answers[2] || null,
      submission_id: submissionData.id
    }]);

  if (projectError) throw projectError;

  // Trigger the analysis
  const { error: analysisError } = await supabase.functions.invoke('analyze-submission', {
    body: { submissionId: submissionData.id }
  });

  if (analysisError) throw analysisError;

  return submissionData.id;
};
