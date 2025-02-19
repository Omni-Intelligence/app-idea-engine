
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OPENAI_CONFIG, corsHeaders } from "../_shared/openai-config.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appIdea, question } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    const prompt = `For this app idea: "${appIdea}", please provide a thoughtful answer to this question: "${question}"

Provide a clear, practical answer that:
- Is specific and actionable
- Considers best practices
- Remains focused on the core requirements
- Is 2-3 sentences long`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        ...OPENAI_CONFIG.headers,
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: 'You are a software product manager helping to define project requirements.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate answer');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-answer function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
