
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

    const prompt = `Recommend a comprehensive technology stack for this software project:

Project Title: ${project.title}
Project Description: ${project.description || 'Not provided'}
Project Idea: ${project.project_idea || 'Not provided'}

Context from questionnaire:
${responses?.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n') || 'No additional context provided'}

Please provide a detailed technology stack recommendation that includes:
1. Frontend Framework & Libraries
2. Backend Technologies
3. Database Solutions
4. API Architecture
5. DevOps & Deployment
6. Testing Tools
7. Performance Monitoring
8. Security Tools

For each recommendation, provide:
- Justification for the choice
- Key features and benefits
- Potential challenges and mitigation strategies
- Alternative options considered

Format this as a clear, structured document with sections and bullet points.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a senior software architect specializing in technology stack selection and architecture.' },
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
        document_type: 'Tech Stack Document',
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
    console.error('Error in generate-tech-stack function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
