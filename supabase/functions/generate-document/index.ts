
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
    const { submissionId, documentType, userId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the submission and its analysis
    const { data: submission, error: fetchError } = await supabaseClient
      .from('project_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      throw new Error('Failed to fetch submission');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the prompt based on document type
    let prompt = '';
    switch (documentType) {
      case 'technical_specs':
        prompt = `You are a senior technical architect. Based on this software project proposal and its analysis, create detailed technical specifications. Include system architecture, data models, APIs, security considerations, and implementation details.

Project Details:
${JSON.stringify(submission, null, 2)}

Previous AI Analysis:
${submission.ai_analysis}

Focus on:
1. System Architecture Overview
2. Database Schema and Data Models
3. API Specifications and Endpoints
4. Security Implementation Details
5. Integration Requirements
6. Performance Considerations
7. Technical Dependencies

Format the response as a detailed technical specification document with clear sections and subsections. Use plain text formatting only.`;
        break;
      case 'user_stories':
        prompt = `You are a product manager. Create comprehensive user stories and acceptance criteria based on this software project proposal and its analysis.

Project Details:
${JSON.stringify(submission, null, 2)}

Previous AI Analysis:
${submission.ai_analysis}

For each core feature:
1. Write detailed user stories in the format "As a [user type], I want [action] so that [benefit]"
2. Include acceptance criteria for each story
3. Add priority levels and effort estimates
4. Consider edge cases and error scenarios

Format as a structured list of user stories with clear acceptance criteria for each feature. Use plain text formatting only.`;
        break;
      case 'api_docs':
        prompt = `You are an API documentation specialist. Create comprehensive API documentation for this software project based on the proposal and analysis.

Project Details:
${JSON.stringify(submission, null, 2)}

Previous AI Analysis:
${submission.ai_analysis}

Include:
1. API Overview and Architecture
2. Authentication and Authorization
3. Detailed Endpoint Documentation
4. Request/Response Formats
5. Error Handling
6. Rate Limiting and Usage Guidelines
7. Code Examples
8. Security Considerations

Format as a clear API documentation with examples and specifications. Use plain text formatting only.`;
        break;
      case 'implementation_guide':
        prompt = `You are a senior software developer. Create a detailed implementation guide for developers building this software project, based on the proposal and its analysis.

Project Details:
${JSON.stringify(submission, null, 2)}

Previous AI Analysis:
${submission.ai_analysis}

Include:
1. Development Environment Setup
2. Project Structure and Organization
3. Coding Standards and Best Practices
4. Build and Deployment Procedures
5. Testing Strategy
6. Performance Optimization Guidelines
7. Security Implementation Guidelines
8. Maintenance and Troubleshooting

Format as a clear implementation guide with step-by-step instructions and best practices. Use plain text formatting only.`;
        break;
      default:
        throw new Error('Invalid document type');
    }

    console.log('Calling OpenAI API for document type:', documentType);
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o3-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a technical documentation expert. Generate clear, detailed documentation based on project requirements. Use plain text formatting only.' 
          },
          { role: 'user', content: prompt }
        ]
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const aiResult = await openAIResponse.json();
    const documentContent = aiResult.choices[0].message.content;

    console.log('Document generated successfully, saving to database...');

    // Save the generated document
    const { data: document, error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        submission_id: submissionId,
        user_id: userId,
        document_type: documentType,
        content: documentContent,
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
