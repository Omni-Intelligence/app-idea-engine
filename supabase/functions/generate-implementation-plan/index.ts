
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

    const prompt = `As a technical project manager with expertise in software development, create a comprehensive implementation plan for this project.

Project Idea:
${appIdea}

Project Context:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Create a detailed implementation plan with these sections:

1. Project Phases
   - Discovery phase
   - Design phase
   - Development phase
   - Testing phase
   - Deployment phase
   - Post-launch phase

2. Timeline & Milestones
   - Major milestones
   - Dependencies
   - Critical path
   - Resource allocation
   - Risk factors

3. Development Roadmap
   - Feature prioritization
   - Sprint planning
   - Release strategy
   - Version control
   - Code review process

4. Resource Requirements
   - Team composition
   - Technical resources
   - Infrastructure needs
   - Third-party services
   - Development tools

5. Quality Assurance
   - Testing strategy
   - Quality metrics
   - Code coverage
   - Performance benchmarks
   - Security audits

6. Deployment Strategy
   - Environment setup
   - Deployment process
   - Rollback procedures
   - Monitoring setup
   - Maintenance plan

7. Risk Management
   - Potential risks
   - Mitigation strategies
   - Contingency plans
   - Change management
   - Issue resolution

8. Success Metrics
   - Performance KPIs
   - Quality metrics
   - User adoption
   - Business metrics
   - Technical debt

Format this as a comprehensive plan that will guide the team through successful implementation of the project.`;

    console.log('Generating implementation plan document...');
    
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
            content: 'You are a technical project manager specializing in software development implementation. Create detailed, practical implementation plans.' 
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

    console.log('Implementation plan document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'implementation_plan',
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
    console.error('Error in generate-implementation-plan function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
