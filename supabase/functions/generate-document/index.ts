
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
    const { documentType, appIdea, questions, answers, projectId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    switch (documentType) {
      case 'requirements':
        prompt = `As a senior business analyst, create a comprehensive project requirements document for this software project. Use the provided app idea and Q&A session to detail the functional and non-functional requirements.

Project Idea:
${appIdea}

Q&A Session:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Please organize the document with these sections:
1. Project Overview
2. Business Requirements
3. Functional Requirements
4. Non-Functional Requirements
5. User Stories
6. Constraints and Assumptions
7. Success Criteria

Format as a clear, professional document with detailed sections and subsections.`;
        break;

      case 'app_flow':
        prompt = `As a UX designer, create a detailed app flow document that outlines the user journey and application workflow based on this software project proposal.

Project Idea:
${appIdea}

Q&A Session:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Include:
1. User Journey Maps
2. Core User Flows
3. Screen-to-Screen Navigation
4. User Interaction Points
5. Key Features Flow
6. Error Handling Flows
7. Success Paths

Format as a clear document that helps developers understand the app's flow and user experience.`;
        break;

      case 'tech_stack':
        prompt = `As a technical architect, recommend and justify a comprehensive technology stack for this software project based on the requirements and scale.

Project Idea:
${appIdea}

Q&A Session:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Include detailed recommendations for:
1. Frontend Framework & Libraries
2. Backend Technologies
3. Database Solutions
4. API Architecture
5. DevOps & Deployment
6. Security Measures
7. Performance Optimization Tools
8. Monitoring & Analytics

For each recommendation, provide:
- Justification for the choice
- Pros and cons
- Alternatives considered
- Integration considerations
- Scalability factors`;
        break;

      default:
        throw new Error('Invalid document type');
    }

    console.log('Generating document:', documentType);
    
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
            content: 'You are a technical documentation expert. Generate clear, detailed documentation based on project requirements.' 
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

    console.log('Document generated successfully, saving to database...');

    // Save the generated document
    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: documentType,
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
    console.error('Error in generate-document function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
