
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

    const prompt = `As a backend architect with expertise in scalable systems, create a comprehensive backend architecture document for this project.

Project Idea:
${appIdea}

Project Context:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Create a detailed backend architecture document with these sections:

1. System Architecture
   - Service architecture
   - API design
   - Data flow
   - Integration points
   - Scalability considerations

2. Database Design
   - Schema design
   - Data models
   - Relationships
   - Indexing strategy
   - Migration strategy

3. API Documentation
   - REST/GraphQL endpoints
   - Authentication
   - Rate limiting
   - Versioning
   - Error handling

4. Security Architecture
   - Authentication system
   - Authorization framework
   - Data encryption
   - Security protocols
   - Compliance measures

5. Performance Optimization
   - Caching strategy
   - Query optimization
   - Background jobs
   - Rate limiting
   - Resource management

6. Development Standards
   - Code organization
   - Error handling
   - Logging
   - Testing requirements
   - Documentation

7. Infrastructure
   - Deployment architecture
   - Scaling strategy
   - Monitoring
   - Backup systems
   - Disaster recovery

8. Integration Guidelines
   - Third-party services
   - External APIs
   - Message queues
   - Event handling
   - Webhook management

Format this as a comprehensive technical document that will guide the backend development team in implementing a robust and scalable system.`;

    console.log('Generating backend structure document...');
    
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
            content: 'You are a backend architect specializing in scalable system design. Create detailed, practical backend architecture documentation.' 
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

    console.log('Backend structure document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'backend_structure',
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
    console.error('Error in generate-backend-structure function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
