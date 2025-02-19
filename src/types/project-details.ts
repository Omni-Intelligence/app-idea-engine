
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus | null;
  created_at: string;
  updated_at: string;
  project_idea: string | null;
  user_id: string;
}

export interface GeneratedDocument {
  id: string;
  content: string;
  document_type: string;
  status: string;
  created_at: string;
}

export interface QuestionnaireResponse {
  question: string;
  answer: string;
  question_order: number;
}
