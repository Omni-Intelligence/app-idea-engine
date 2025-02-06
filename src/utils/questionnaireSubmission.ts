
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

  // Extract or set default values for required fields
  const initialIdea = processedAnswers.initial || processedAnswers[0] || '';
  
  // For authenticated users, store the data and create a project
  const submission = {
    user_id: session.user.id,
    initial_idea: initialIdea,
    answers: processedAnswers,
    // Required fields with default values if not provided
    project_idea: initialIdea, // Use initial idea as project idea
    target_audience: processedAnswers[1] || 'Not specified',
    problem_solved: processedAnswers[2] || 'Not specified',
    core_features: processedAnswers[3] || 'Not specified',
    ai_integration: processedAnswers[4] || 'Not specified',
    monetization: processedAnswers[5] || 'Not specified',
    development_timeline: processedAnswers[6] || 'Not specified',
    technical_expertise: processedAnswers[7] || 'Not specified',
    tech_stack: processedAnswers[8] || 'Not specified',
    scaling_expectation: processedAnswers[9] || 'Not specified'
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
      title: initialIdea || 'Untitled Project',
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
