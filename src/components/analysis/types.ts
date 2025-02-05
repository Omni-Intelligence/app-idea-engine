
export type DocumentType = 
  | 'technical_specs' 
  | 'user_stories' 
  | 'api_docs' 
  | 'implementation_guide'
  | 'deployment_guide'
  | 'testing_strategy'
  | 'security_guidelines'
  | 'maintenance_docs';

export interface GeneratedDocument {
  id: string;
  document_type: DocumentType;
  content: string;
  status: 'pending' | 'completed';
  created_at?: string;
  updated_at?: string;
  submission_id?: string;
  user_id?: string;
}
