
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OPENAI_CONFIG } from "../_shared/openai-config.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const systemPrompt = `You are a startup and product ideation expert. When given an industry and business function, generate a list of 4-5 innovative app ideas that could solve real problems in that space. Keep the ideas concise but clear. Format each idea as a simple bullet point list.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: OPENAI_CONFIG.corsHeaders });
  }

  try {
    const { industry, businessFunction } = await req.json();
    
    console.log('Generating app ideas for:', { industry, businessFunction });

    const prompt = `Generate 4-5 app ideas for the ${industry} industry, focusing on ${businessFunction}. Each idea should be 1-2 sentences maximum.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate ideas');
    }

    const data = await response.json();
    const ideas = data.choices[0].message.content
      .split('\n')
      .filter((line: string) => line.trim().startsWith('-'))
      .map((line: string) => line.trim().substring(2));

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...OPENAI_CONFIG.corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-app-ideas function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...OPENAI_CONFIG.corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
