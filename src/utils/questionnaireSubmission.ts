
import { supabase } from '@/integrations/supabase/client';

export const submitQuestionnaire = async (answers: Record<string, string>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("You must be signed in to submit the questionnaire");
  }

  const submission = {
    user_id: session.user.id,
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
      title: answers[0] || 'Untitled Project',
      description: answers[2] || null, // Using the "problem solved" answer as description
    }]);

  if (projectError) throw projectError;

  // Trigger the analysis
  const { error: analysisError } = await supabase.functions.invoke('analyze-submission', {
    body: { submissionId: submissionData.id }
  });

  if (analysisError) throw analysisError;

  return submissionData.id;
};
