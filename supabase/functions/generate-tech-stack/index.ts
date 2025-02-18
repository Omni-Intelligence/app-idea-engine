
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

    const prompt = `As a technical architect with expertise in modern software development, create a comprehensive technology stack recommendation document for this project.

Project Idea:
${appIdea}

Project Requirements:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Create a detailed technology stack document with these sections:

1. Executive Summary
   - Project overview
   - Key technical requirements
   - Stack overview
   - Implementation timeline

2. Frontend Technology Stack
   - Framework selection
   - UI libraries
   - State management
   - Build tools
   - Testing framework
   - Performance optimization tools

3. Backend Technology Stack
   - Programming language
   - Framework selection
   - API architecture
   - Authentication system
   - Background job processing
   - Caching strategy

4. Database Architecture
   - Database type(s)
   - Data modeling
   - Scaling strategy
   - Backup solutions
   - Data migration plan

5. DevOps & Infrastructure
   - Cloud provider
   - Deployment strategy
   - CI/CD pipeline
   - Monitoring tools
   - Logging system
   - Security measures

6. Third-Party Services
   - External APIs
   - Analytics tools
   - Payment processing
   - Email service
   - File storage
   - Other integrations

7. Security Considerations
   - Authentication methods
   - Authorization strategy
   - Data encryption
   - API security
   - Compliance requirements

8. Scalability & Performance
   - Caching strategies
   - Load balancing
   - Database scaling
   - CDN implementation
   - Performance monitoring

For each technology choice, include:
- Justification
- Pros and cons
- Cost implications
- Learning curve
- Community support
- Long-term viability

Format this as a comprehensive technical document that will guide the development team in implementing the solution.`;

    console.log('Generating tech stack document...');
    
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
            content: 'You are a technical architect specializing in modern software architecture. Create detailed, practical technology stack recommendations.' 
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

    console.log('Tech stack document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'tech_stack',
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
    console.error('Error in generate-tech-stack function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
