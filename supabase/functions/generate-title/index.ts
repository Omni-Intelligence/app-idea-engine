
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OPENAI_CONFIG } from "../_shared/openai-config.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: OPENAI_CONFIG.corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    console.log('Generating title for description:', description.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a product naming expert. Generate a short, clear title (maximum 5 words) that captures the essence of the application being described.' 
          },
          { role: 'user', content: `Generate a concise title for this app: ${description}` }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    const title = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ title }), {
      headers: { ...OPENAI_CONFIG.corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-title function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...OPENAI_CONFIG.corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
