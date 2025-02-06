
import { supabase } from '@/integrations/supabase/client';

export const submitQuestionnaire = async (answers: Record<string | number, string | string[]>) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Convert any array answers to strings for storage
  const processedAnswers: Record<string, string> = {};
  Object.entries(answers).forEach(([key, value]) => {
    processedAnswers[key] = Array.isArray(value) ? value.join(', ') : value;
  });

  // Extract initial idea
  const initialIdea = processedAnswers.initial || processedAnswers[0] || '';
  
  // For authenticated users, create a project
  if (session) {
    // Create a project entry
    const { error: projectError } = await supabase
      .from('user_projects')
      .insert([{
        user_id: session.user.id,
        title: initialIdea || 'Untitled Project',
        description: processedAnswers[2] || null
      }]);

    if (projectError) throw projectError;
  }

  // Trigger the analysis
  const { error: analysisError } = await supabase.functions.invoke('analyze-submission', {
    body: { answers: processedAnswers }
  });

  if (analysisError) throw analysisError;

  return 'completed';
};
