
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    console.log('Function called with projectId:', projectId);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch project details
    const { data: project, error: projectError } = await supabaseClient
      .from('user_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');

    // Fetch questionnaire responses
    const { data: responses, error: responsesError } = await supabaseClient
      .from('questionnaire_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('question_order');

    if (responsesError) throw responsesError;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not found');

    const prompt = `Generate a detailed software requirements document for this project:

Project Title: ${project.title}
Project Description: ${project.description || 'Not provided'}
Project Idea: ${project.project_idea || 'Not provided'}

Requirements Context:
${responses?.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n') || 'No additional context provided'}

Please provide a comprehensive requirements document that includes:
1. Project Overview
2. Functional Requirements
3. Technical Requirements
4. User Interface Requirements
5. Security Requirements
6. Implementation Considerations
7. Project Constraints

Format this as a clear, structured document with sections and bullet points where appropriate.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a senior software requirements specialist. Create detailed, practical requirements documentation.' },
          { role: 'user', content: prompt }
        ]
      }),
    });

    const result = await response.json();
    const content = result.choices[0].message.content;

    // Save the generated document
    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content,
        document_type: 'requirements',
        project_id: projectId,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
