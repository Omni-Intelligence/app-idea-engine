
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { OPENAI_CONFIG, corsHeaders } from "../_shared/openai-config.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, userId } = await req.json();
    console.log('Function called with projectId:', projectId, 'userId:', userId);

    if (!projectId || !userId) {
      throw new Error('Project ID and User ID are required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: project, error: projectError } = await supabaseClient
      .from('user_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');

    const { data: responses, error: responsesError } = await supabaseClient
      .from('questionnaire_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('question_order');

    if (responsesError) throw responsesError;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    const prompt = `Create a detailed application flow document for this software project:

Project Title: ${project.title}
Project Description: ${project.description || 'Not provided'}
Project Idea: ${project.project_idea || 'Not provided'}

Context from questionnaire:
${responses?.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n') || 'No additional context provided'}

Please provide a comprehensive application flow document that includes:
1. User Journeys
2. Core Workflows
3. Feature Interactions
4. State Management
5. Data Flow
6. Error Handling
7. Edge Cases
8. User Interface States

Format this as a clear, structured document with diagrams described in text format.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        ...OPENAI_CONFIG.headers,
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: OPENAI_CONFIG.defaultSystemPrompt },
          { role: 'user', content: prompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    console.log('Saving document to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content,
        document_type: 'App Flow Document',
        project_id: projectId,
        user_id: userId,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving document:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-app-flow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
