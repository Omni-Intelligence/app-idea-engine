import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, userId } = await req.json();
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Initialize Supabase client with admin privileges
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch project details and questionnaire responses
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

    // Prepare data for OpenAI
    const systemPrompt = `You are an expert software architect and UX designer. Your task is to create a detailed app flow document that outlines the user journey and application flow based on the project requirements and questionnaire responses. Focus on:
1. User journeys and interaction points
2. Main application flows and navigation paths
3. Key features and their interconnections
4. User interface transitions and state changes
5. Error handling and edge cases`;

    const userPrompt = `
Project Idea: ${project.project_idea}

Questionnaire Responses:
${responses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}

Please provide a comprehensive app flow document based on this information. Structure your response in clear sections and use bullet points where appropriate.`;

    // Generate content using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    // Save the generated document
    const { data: document, error: documentError } = await supabaseClient
      .from('generated_documents')
      .insert({
        project_id: projectId,
        document_type: 'App Flow Document',
        content: generatedContent,
        status: 'completed',
        user_id: userId
      })
      .select()
      .single();

    if (documentError) throw documentError;

    return new Response(
      JSON.stringify({ success: true, data: document }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-app-flow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
