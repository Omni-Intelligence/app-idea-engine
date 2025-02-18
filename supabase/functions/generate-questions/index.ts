
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initialIdea, submissionId } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('Generating questions for idea:', initialIdea);

    // Generate questions using OpenAI
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
            content: `You are an expert project consultant. Your task is to generate relevant questions that will help gather important information about a software project idea. Focus on key aspects like target audience, problem solved, core features, AI integration possibilities, monetization strategy, development timeline, technical expertise required, tech stack, and scaling expectations.

            Generate the questions in a structured JSON format with the following schema:
            {
              questions: [
                {
                  question: string,
                  type: "text" | "multiple",
                  placeholder?: string,
                  options?: Array<{value: string, label: string}>,
                  order_index: number
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Generate specific and relevant questions for this project idea: ${initialIdea}`
          }
        ],
      }),
    });

    const data = await response.json();
    const questionsData = JSON.parse(data.choices[0].message.content);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store questions in the database
    const { error: insertError } = await supabase
      .from('dynamic_questions')
      .insert(
        questionsData.questions.map((q: any) => ({
          ...q,
          submission_id: submissionId
        }))
      );

    if (insertError) throw insertError;

    // Update submission status
    const { error: updateError } = await supabase
      .from('project_submissions')
      .update({ questions_generated: true })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
