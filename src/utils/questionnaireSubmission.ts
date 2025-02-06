
import { supabase } from '@/integrations/supabase/client';

export const submitQuestionnaire = async (answers: Record<string | number, string | string[]>) => {
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

  // Convert any array answers to strings for storage
  const processedAnswers: Record<string, string> = {};
  Object.entries(answers).forEach(([key, value]) => {
    processedAnswers[key] = Array.isArray(value) ? value.join(', ') : value;
  });

  // For authenticated users, store the data and create a project
  const submission = {
    user_id: session.user.id,
    initial_idea: processedAnswers.initial || '',
    answers: processedAnswers
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
      title: processedAnswers.initial || processedAnswers[0] || 'Untitled Project',
      description: processedAnswers[2] || null,
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

