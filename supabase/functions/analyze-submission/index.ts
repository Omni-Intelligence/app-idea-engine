
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OPENAI_CONFIG, corsHeaders } from "../_shared/openai-config.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appIdea, responses } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OpenAI API key not configured');

    const prompt = `Analyze this software project submission:

App Idea: ${appIdea}

Questionnaire Responses:
${Object.entries(responses).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}

Please provide:
1. A concise project title (one line)
2. A brief project description (2-3 sentences)
3. Key technical considerations (2-3 points)
4. Potential challenges (2-3 points)

Format your response in clear sections.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        ...OPENAI_CONFIG.headers,
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: 'You are a software project analyst helping to evaluate and structure project submissions.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze submission');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Parse the analysis to extract sections
    const sections = analysis.split('\n\n');
    const title = sections[0].replace(/^.*?: /, '').trim();
    const description = sections[1].replace(/^.*?: /, '').trim();

    return new Response(
      JSON.stringify({ 
        title,
        description,
        fullAnalysis: analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-submission function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
