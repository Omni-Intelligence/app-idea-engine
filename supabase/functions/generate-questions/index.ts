
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appIdea } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    if (!appIdea) {
      throw new Error('App idea is required');
    }

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
            content: 'You are an expert product manager. Generate 7 detailed questions about the app idea. Each question should focus on different aspects like target users, core features, technical requirements, etc. Format your response as a simple array of strings, one question per line.'
          },
          {
            role: 'user',
            content: `Generate 7 questions to gather more information about this app idea: ${appIdea}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate questions');
    }

    const data = await response.json();
    
    // Clean up the response to ensure we get an array of questions
    const questions = data.choices[0].message.content
      .split('\n')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('[') && !q.startsWith(']') && !q.startsWith('"'))
      .slice(0, 7);

    if (questions.length !== 7) {
      throw new Error('Failed to generate the correct number of questions');
    }

    return new Response(JSON.stringify({ questions }), {
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
