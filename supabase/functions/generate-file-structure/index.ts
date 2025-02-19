
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    const prompt = `As a software architect, create a comprehensive file structure and organization document for this project.

Project Idea:
${project.project_idea}

Project Context:
${responses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}

Create a detailed file structure document with these sections:

1. Project Root Structure
   - Directory organization
   - Configuration files
   - Build files
   - Documentation files
   - Environment files

2. Source Code Organization
   - Components structure
   - Features organization
   - Shared utilities
   - Type definitions
   - Assets management

3. Test File Structure
   - Unit tests
   - Integration tests
   - E2E tests
   - Test utilities
   - Test data

4. Documentation Structure
   - API documentation
   - Component documentation
   - Setup guides
   - Development guides
   - Deployment guides

5. Build and Deploy
   - Build configuration
   - Environment configs
   - CI/CD files
   - Docker files
   - Deploy scripts

6. Naming Conventions
   - File naming
   - Directory naming
   - Component naming
   - Test file naming
   - Asset naming

For each section, provide:
- Detailed structure
- Purpose of each directory
- File naming conventions
- Organization rules
- Best practices`;

    console.log('Generating file structure document...');
    
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
            content: 'You are a software architect specializing in project organization and file structure. Create detailed, practical file structure documentation.' 
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

    console.log('File structure document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'file_structure',
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
    console.error('Error in generate-file-structure function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
