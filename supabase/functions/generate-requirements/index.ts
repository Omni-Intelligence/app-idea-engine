
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
    const { appIdea, questions, answers, projectId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `As a senior business analyst with extensive experience in software requirements gathering, create a comprehensive software requirements specification (SRS) document for this project.

Project Idea:
${appIdea}

Requirements Gathering Session:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Please create a detailed SRS document with the following sections:

1. Executive Summary
   - Project purpose
   - Key stakeholders
   - Project scope

2. Project Overview
   - Business context
   - Project objectives
   - Target users
   - System overview

3. Functional Requirements
   - Core features
   - User interactions
   - System behaviors
   - Data handling
   - Integration requirements

4. Non-Functional Requirements
   - Performance requirements 
   - Security requirements
   - Scalability requirements
   - Reliability requirements
   - Usability requirements
   - Compliance requirements

5. User Stories
   - Detailed user personas
   - User journey maps
   - Acceptance criteria

6. System Constraints
   - Technical limitations
   - Business constraints
   - Regulatory constraints
   - Resource constraints

7. Assumptions and Dependencies
   - Technical assumptions
   - Business assumptions
   - External dependencies

8. Success Criteria
   - Performance metrics
   - Quality metrics
   - Business metrics

Format this as a professional, well-structured document that will serve as a clear guide for development teams.`;

    console.log('Generating requirements document...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an experienced business analyst specializing in software requirements documentation. Generate clear, detailed, and actionable requirements documents.' 
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

    console.log('Requirements document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'requirements',
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
    console.error('Error in generate-requirements function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
