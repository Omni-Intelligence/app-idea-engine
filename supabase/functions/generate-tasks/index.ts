
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
    const { industry, businessFunction } = await req.json();

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
            content: `You are a task analysis expert that helps identify common tasks and pain points in different industries and business functions. 
            Generate 5 specific, realistic daily tasks that someone in this role typically handles.
            Format your response as a JSON array of strings, each describing a task in 10-15 words.
            Focus on tasks that could potentially be automated or improved with software.`
          },
          { 
            role: 'user', 
            content: `Industry: ${industry}\nBusiness Function: ${businessFunction}` 
          }
        ],
      }),
    });

    const data = await response.json();
    let tasks: string[];
    
    try {
      tasks = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Error parsing OpenAI response as JSON:', e);
      // Fallback: split by newlines and clean up
      tasks = data.choices[0].message.content
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 5);
    }

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-tasks function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
