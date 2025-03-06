
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OPENAI_CONFIG, corsHeaders } from "../_shared/openai-config.ts";
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: OPENAI_CONFIG.corsHeaders });
  }

  try {
    const { dailyTasks, industry, businessFunction } = await req.json();

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
            content: `You are a creative consultant that helps people identify opportunities for automation and app development in their work. 
            You will receive information about:
            1. The user's industry
            2. Their business function/role
            3. Their daily tasks
            
            Using this context, suggest a specific, focused project idea that could help them be more efficient or solve a problem.
            Your response should be tailored to their specific industry and business function.
            Format your response as a clear project idea pitch in 2-3 sentences, focusing on the core value proposition.
            Do not use any markdown formatting, special characters, or bullet points - just plain text.`
          },
          { 
            role: 'user', 
            content: `Industry: ${industry}\nBusiness Function: ${businessFunction}\nDaily Tasks: ${dailyTasks}` 
          }
        ],
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...OPENAI_CONFIG.corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-idea function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...OPENAI_CONFIG.corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
