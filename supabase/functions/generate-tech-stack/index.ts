
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
    if (!responses) throw new Error('No questionnaire responses found');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    const prompt = `As a software architect, recommend a comprehensive technology stack for this project.

Project Overview:
${project.project_idea}

Project Context:
${responses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}

Create a detailed technology stack recommendation document with these sections:

1. Frontend Technology Stack
   - Framework selection
   - UI libraries
   - State management
   - Build tools
   - Testing frameworks

2. Backend Technology Stack
   - Programming language
   - Framework selection
   - API architecture
   - Database selection
   - Caching strategy

3. Infrastructure
   - Cloud platform
   - Deployment strategy
   - CI/CD pipeline
   - Monitoring tools
   - Security tools

4. Development Tools
   - Version control
   - IDE recommendations
   - Code quality tools
   - Documentation tools
   - Collaboration tools

For each technology recommended, include:
- Justification for selection
- Pros and cons
- Alternative options
- Implementation considerations
- Cost implications`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a senior software architect. Create detailed, practical technology recommendations.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const aiResult = await response.json();
    const documentContent = aiResult.choices[0].message.content;

    console.log('Tech stack document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'tech_stack',
        project_id: projectId,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving document:', insertError);
      throw new Error('Failed to save generated document');
    }

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-tech-stack function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
