
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

    const prompt = `As a senior frontend architect with expertise in modern web development, create comprehensive frontend development guidelines for this project.

Project Idea:
${appIdea}

Project Context:
${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}

Create detailed frontend guidelines with these sections:

1. Architecture Overview
   - Component structure
   - State management
   - Routing strategy
   - Data flow patterns

2. Code Style Guidelines
   - Naming conventions
   - File organization
   - Component patterns
   - Type definitions
   - Documentation standards

3. UI/UX Standards
   - Design system implementation
   - Component library usage
   - Responsive design principles
   - Accessibility requirements
   - Theme management

4. Performance Guidelines
   - Code splitting
   - Bundle optimization
   - Image optimization
   - Caching strategies
   - Lazy loading

5. Testing Standards
   - Unit testing requirements
   - Integration testing
   - E2E testing
   - Testing best practices
   - Coverage requirements

6. State Management
   - State organization
   - Data fetching patterns
   - Cache management
   - Form handling
   - Error handling

7. Security Best Practices
   - Input validation
   - XSS prevention
   - CSRF protection
   - Secure data handling
   - API security

8. Development Workflow
   - Git workflow
   - Code review process
   - Documentation requirements
   - Build process
   - Deployment guidelines

Format this as a comprehensive guide that will ensure consistency and quality across the frontend development team.`;

    console.log('Generating frontend guidelines document...');
    
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
            content: 'You are a senior frontend architect specializing in modern web development practices. Create detailed, practical frontend development guidelines.' 
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

    console.log('Frontend guidelines document generated successfully, saving to database...');

    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        content: documentContent,
        document_type: 'frontend_guidelines',
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
    console.error('Error in generate-frontend-guidelines function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
