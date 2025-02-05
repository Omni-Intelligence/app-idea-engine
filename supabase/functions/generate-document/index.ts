
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
    const { submissionId, documentType, userId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the submission and its analysis
    const { data: submission, error: fetchError } = await supabaseClient
      .from('project_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      throw new Error('Failed to fetch submission');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the prompt based on document type
    let prompt = '';
    switch (documentType) {
      case 'technical_specs':
        prompt = `Based on this software project proposal, create detailed technical specifications document. Include architecture, data models, APIs, and implementation details.

Project Details:
${JSON.stringify(submission, null, 2)}

Format the response as a detailed technical specification document with clear sections.`;
        break;
      case 'user_stories':
        prompt = `Create detailed user stories and acceptance criteria for this software project.

Project Details:
${JSON.stringify(submission, null, 2)}

Format as a list of user stories with acceptance criteria for each feature.`;
        break;
      case 'api_docs':
        prompt = `Create comprehensive API documentation for this software project.

Project Details:
${JSON.stringify(submission, null, 2)}

Include endpoints, request/response formats, authentication, and examples.`;
        break;
      case 'implementation_guide':
        prompt = `Create a detailed implementation guide for developers building this software project.

Project Details:
${JSON.stringify(submission, null, 2)}

Include setup instructions, coding standards, and best practices.`;
        break;
      default:
        throw new Error('Invalid document type');
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o3-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a technical documentation expert. Generate clear, detailed documentation based on project requirements.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const aiResult = await openAIResponse.json();
    const documentContent = aiResult.choices[0].message.content;

    // Save the generated document
    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        submission_id: submissionId,
        user_id: userId,
        document_type: documentType,
        content: documentContent,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to save generated document');
    }

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-document function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
