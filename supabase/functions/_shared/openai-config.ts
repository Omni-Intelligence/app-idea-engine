
export const OPENAI_CONFIG = {
  model: 'gpt-4o-mini',
  headers: {
    'Content-Type': 'application/json',
  },
  defaultSystemPrompt: 'You are a senior software architect and technical writer, creating detailed documentation.',
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
