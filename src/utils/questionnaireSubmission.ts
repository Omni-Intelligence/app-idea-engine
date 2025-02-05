
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

  const { data: submissionData, error } = await supabase
    .from('project_submissions')
    .insert([submission])
    .select()
    .single();

  if (error) throw error;

  const { error: analysisError } = await supabase.functions.invoke('analyze-submission', {
    body: { submissionId: submissionData.id }
  });

  if (analysisError) throw analysisError;

  return submissionData.id;
};
