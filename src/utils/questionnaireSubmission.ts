
import { supabase } from '@/integrations/supabase/client';

export const submitQuestionnaire = async (answers: Record<string, string>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("You must be signed in to submit the questionnaire");
  }

  const submission = {
    user_id: session.user.id,
    initial_idea: answers.initial || '',  // Save the initial idea explicitly
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
      title: answers.initial || answers[0] || 'Untitled Project', // Use initial idea as title if available
      description: answers[2] || null,
    }]);

  if (projectError) throw projectError;

  // Trigger the analysis
  const { error: analysisError } = await supabase.functions.invoke('analyze-submission', {
    body: { submissionId: submissionData.id }
  });

  if (analysisError) throw analysisError;

  return submissionData.id;
};
