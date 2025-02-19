
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are a senior software architect and product strategist. When given a type of application to build, generate a comprehensive project outline including:

1. A clear project name that's memorable and reflects the app's purpose
2. Target audience identification
3. Core features or sections (minimum 5-6 key points)
4. Tech stack recommendations (frontend, backend, and optional AI integrations)
5. Design preferences and UI/UX guidelines

Format the response in a clear, structured way using these exact sections:

Project Name:
[Name with brief explanation]

Target Audience:
[Detailed description of primary users]

Core Features:
1. [Feature 1]
2. [Feature 2]
...

Tech Stack (Recommended Defaults):
• Frontend: [Technologies]
• Backend & Storage: [Technologies]
• Optional AI Integration: [If applicable]

Design Preferences:
[Clear UI/UX guidelines]

Be specific and practical in your recommendations, focusing on modern, production-ready technologies.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, industry, businessFunction } = await req.json();
    
    console.log('Generating outline for:', { template, industry, businessFunction });

    const prompt = `Generate a comprehensive outline for: ${template}${industry ? ` in the ${industry} industry` : ''}${businessFunction ? ` focusing on ${businessFunction}` : ''}.

The outline should help a development team understand the scope and requirements of building this application.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate outline');
    }

    const data = await response.json();
    const generatedOutline = data.choices[0].message.content;

    return new Response(JSON.stringify({ outline: generatedOutline }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-app-outline function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
