
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
    const { initialIdea, submissionId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate questions using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Given this project idea: "${initialIdea}", generate 10 specific questions that will help expand and clarify the project details. Structure your response as a JSON array where each object has these properties:
    - question: the actual question text
    - type: either "text" for open-ended questions or "multiple" for multiple choice
    - placeholder: helpful placeholder text for text inputs
    - options: for multiple choice questions, an array of objects with { value: string, label: string }
    - order_index: number from 0 to 9 indicating question order

    Make questions very specific to the project idea. Include questions about technical implementation, target users, core features, and business model.`;

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
            content: 'You are a project planning assistant that generates specific questions to help users define their project requirements.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const aiData = await response.json();
    const questionsJson = JSON.parse(aiData.choices[0].message.content);

    // Insert questions into the database
    const { error: insertError } = await supabaseClient
      .from('dynamic_questions')
      .insert(questionsJson.map((q: any) => ({
        submission_id: submissionId,
        question: q.question,
        type: q.type,
        placeholder: q.placeholder,
        options: q.options,
        order_index: q.order_index
      })));

    if (insertError) throw insertError;

    // Update submission to mark questions as generated
    const { error: updateError } = await supabaseClient
      .from('project_submissions')
      .update({ questions_generated: true })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
