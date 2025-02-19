
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OPENAI_CONFIG, corsHeaders } from "../_shared/openai-config.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appIdea } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    const prompt = `As a software development expert, generate a list of essential questions to gather requirements for this app idea: "${appIdea}"

The questions should cover:
1. Target users and user stories
2. Core features and functionality
3. Technical requirements
4. Integration needs
5. Security considerations
6. Scalability requirements
7. Performance expectations
8. User interface preferences

Generate 8-10 clear, focused questions that will help define the project scope and requirements.
Format each question on a new line, starting with a dash (-).
Keep questions concise but specific.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        ...OPENAI_CONFIG.headers,
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: 'You are a software requirements analyst helping to define project specifications.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract questions from the content
    const questions = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.substring(1).trim());

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
