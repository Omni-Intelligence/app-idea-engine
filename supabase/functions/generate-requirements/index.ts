
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
    
    if (!appIdea || !questions || !answers || !projectId) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openAIApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    console.log('Starting requirements generation for project:', projectId);

    const prompt = `As a senior business analyst, create a comprehensive software requirements specification (SRS) document for this project.

Project Idea:
${appIdea}

Requirements Gathering Session:
${questions.map((q: string, i: number) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Create a detailed SRS document with these sections:
1. Executive Summary
2. Project Overview
3. Functional Requirements
4. Non-Functional Requirements
5. User Stories
6. System Constraints
7. Assumptions and Dependencies
8. Success Criteria`;

    console.log('Calling OpenAI API...');
    
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
            content: 'You are an experienced business analyst specializing in software requirements documentation. Generate clear, detailed, and actionable requirements documents.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const aiResult = await response.json();
    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    const documentContent = aiResult.choices[0].message.content;
    console.log('Successfully generated requirements document');

    // First, check if a document already exists
    const { data: existingDoc, error: checkError } = await supabaseClient
      .from('generated_documents')
      .select('id')
      .eq('submission_id', projectId)
      .eq('document_type', 'requirements')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the "not found" error code
      console.error('Error checking existing document:', checkError);
      throw checkError;
    }

    let document;
    if (existingDoc) {
      // Update existing document
      const { data, error: updateError } = await supabaseClient
        .from('generated_documents')
        .update({
          content: documentContent,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDoc.id)
        .select()
        .single();

      if (updateError) throw updateError;
      document = data;
    } else {
      // Insert new document
      const { data, error: insertError } = await supabaseClient
        .from('generated_documents')
        .insert({
          content: documentContent,
          document_type: 'requirements',
          submission_id: projectId,
          status: 'completed',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      document = data;
    }

    console.log('Successfully saved document to database');

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-requirements function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
