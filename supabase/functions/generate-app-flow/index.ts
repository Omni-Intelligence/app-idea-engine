
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appIdea, questions, answers, projectId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `As a UX architect and flow design specialist, create a comprehensive application flow document that details the user journey and interaction patterns for this software project.

Project Idea:
${appIdea}

Project Details:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Create a detailed application flow document with these sections:

1. User Journey Overview
   - Primary user personas
   - Key user objectives
   - Success metrics

2. Core User Flows
   - Authentication flows
   - Main feature flows
   - Administrative flows
   - Support flows

3. Screen-to-Screen Navigation
   - Navigation hierarchy
   - Screen transitions
   - State management
   - Data persistence

4. Interaction Patterns
   - User input handling
   - Feedback mechanisms
   - Error handling
   - Loading states
   - Success states

5. Feature-Specific Flows
   - Detailed step-by-step flows
   - Decision points
   - Alternative paths
   - Edge cases

6. Data Flow
   - Data entry points
   - Data validation
   - Data processing
   - Data presentation

7. Error Handling
   - Error prevention
   - Error recovery
   - User guidance
   - System recovery

8. Performance Considerations
   - Loading indicators
   - Offline capabilities
   - Caching strategies
   - Progressive enhancement

Format this as a clear, actionable document that will guide both designers and developers in implementing a seamless user experience.`;

    console.log('Generating app flow document...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are a UX architect specializing in application flow design. Create detailed, practical flow documentation that bridges design and development.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const aiResult = await response.json();
    const documentContent = aiResult.choices[0].message.content;

    console.log('App flow document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'app_flow',
        project_id: projectId,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving document:', insertError);
      throw new Error('Failed to save generated document');
    }

    return new Response(
      JSON.stringify({ success: true, document }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-app-flow function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
