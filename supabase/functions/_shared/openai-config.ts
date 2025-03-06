
export const OPENAI_CONFIG = {
  model: 'o3-mini',
  headers: {
    'Content-Type': 'application/json',
  },
  defaultSystemPrompt: 'You are a senior software architect and technical writer, creating detailed documentation.',
  corsHeaders: {
    'Access-Control-Allow-Origin': '*',
    // 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
