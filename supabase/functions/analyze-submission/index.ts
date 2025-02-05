
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
    const { submissionId } = await req.json();
    console.log('Processing submission:', submissionId);
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the submission
    const { data: submission, error: fetchError } = await supabaseClient
      .from('project_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      console.error('Failed to fetch submission:', fetchError);
      throw new Error('Failed to fetch submission');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the prompt for OpenAI
    const prompt = `Please analyze this software project proposal and provide detailed feedback and recommendations:

Project Idea: ${submission.project_idea}
Target Audience: ${submission.target_audience}
Problem Solved: ${submission.problem_solved}
Core Features: ${submission.core_features}
AI Integration: ${submission.ai_integration}
Monetization Strategy: ${submission.monetization}
Development Timeline: ${submission.development_timeline}
Technical Expertise: ${submission.technical_expertise}
Tech Stack: ${submission.tech_stack}
Scaling Expectation: ${submission.scaling_expectation}

Please provide a comprehensive analysis covering:
1. Technical feasibility and potential challenges
2. Market viability and competitive analysis
3. Development roadmap recommendations
4. Scaling considerations and architecture suggestions
5. Risk assessment and mitigation strategies
6. Monetization strategy evaluation
7. AI integration recommendations`;

    console.log('Calling OpenAI API...');
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a technical project analyst and business consultant with expertise in software development, AI integration, and market analysis.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const aiResult = await openAIResponse.json();
    const analysis = aiResult.choices[0].message.content;

    console.log('Analysis generated successfully, updating submission...');

    // Update the submission with AI analysis
    const { error: updateError } = await supabaseClient
      .from('project_submissions')
      .update({ 
        ai_analysis: analysis,
        status: 'analyzed'
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Failed to update submission:', updateError);
      throw new Error('Failed to update submission with analysis');
    }

    console.log('Submission updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-submission function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
