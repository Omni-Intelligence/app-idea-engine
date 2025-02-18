
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
            content: 'You are a product manager helping to gather requirements. Please generate exactly 7 questions to better understand an app idea. Each question should be on a new line. Do not include any numbers, bullet points, or extra formatting. Do not include any introductory or closing text.'
          },
          {
            role: 'user',
            content: `Generate 7 questions about this app idea: ${appIdea}`
          }
        ],
        temperature: 0.5, // Lower temperature for more consistent formatting
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate questions');
    }

    const data = await response.json();
    console.log('OpenAI response:', data.choices[0].message.content);
    
    // Clean up and parse the response
    let questions = data.choices[0].message.content
      .split('\n')
      .map(q => q.trim())
      .filter(q => {
        // Remove empty lines and common formatting characters
        return q && 
          !q.startsWith('[') && 
          !q.startsWith(']') && 
          !q.startsWith('-') && 
          !q.startsWith('*') && 
          !q.startsWith('#') &&
          !q.startsWith('"') &&
          !q.startsWith('1.') &&
          !q.startsWith('2.') &&
          !q.startsWith('3.') &&
          !q.startsWith('4.') &&
          !q.startsWith('5.') &&
          !q.startsWith('6.') &&
          !q.startsWith('7.');
      });

    // If we have more than 7 questions, take the first 7
    // If we have less, use what we have
    questions = questions.slice(0, 7);

    // If we didn't get any valid questions, throw an error
    if (questions.length === 0) {
      throw new Error('Failed to generate any valid questions');
    }

    // If we got less than 7 questions, generate some generic ones to fill the gap
    while (questions.length < 7) {
      const genericQuestions = [
        "Who is the target audience for this app?",
        "What are the most important features you want to include?",
        "How do you envision users interacting with the app?",
        "What problem does this app solve for users?",
        "What makes this app different from existing solutions?",
        "What technical requirements do you anticipate?",
        "How do you plan to monetize this app?"
      ];
      questions.push(genericQuestions[questions.length]);
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
