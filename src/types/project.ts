
import type { Json } from '@/integrations/supabase/types';

export interface ProjectDetails {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  status: string | null;
  submission_id: string | null;
}

export interface DocumentDetails {
  id: string;
  document_type: string;
  content: string;
  created_at: string;
  status: string;
  submission_id: string | null;
}

export interface ProjectSubmission {
  id: string;
  project_idea: string;
  answers: Json;
  core_features: string;
  target_audience: string;
  problem_solved: string;
  tech_stack: string;
  development_timeline: string;
  monetization: string;
  ai_integration: string;
  technical_expertise: string;
  scaling_expectation: string;
}
