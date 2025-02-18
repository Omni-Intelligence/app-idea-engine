
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { initialIdea } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('Generating questions for idea:', initialIdea);

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
            content: `Generate 10 specific questions to help gather details about a software project idea. The questions should be returned in this exact JSON format:
            {
              "questions": [
                {
                  "id": "q1",
                  "question": "What type of application is this? (Web, Mobile, Desktop)",
                  "type": "text",
                  "placeholder": "Enter the type of application",
                  "order_index": 0
                }
              ]
            }
            
            Include questions about:
            1. Project type/platform
            2. Target audience
            3. Problem being solved
            4. Core features
            5. AI integration plans
            6. Monetization strategy
            7. Development timeline
            8. Technical expertise needed
            9. Tech stack preferences
            10. Scaling expectations
            
            For each question:
            - Keep questions clear and specific
            - Use 'text' type for all questions initially
            - Include a helpful placeholder
            - Use order_index from 0 to 9
            - Generate an id like 'q1', 'q2', etc.`
          },
          {
            role: 'user',
            content: `Generate questions for this project idea: ${initialIdea}`
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    const questionsData = JSON.parse(data.choices[0].message.content);
    console.log('Parsed questions:', questionsData);

    return new Response(JSON.stringify(questionsData), {
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
