
export interface DocumentGenerationData {
  appIdea: string;
  questions: string[];
  answers: Record<string, any>;
  projectId: string;
}

export type DocumentType = {
  id: string;
  title: string;
  description: string;
  available: boolean;
};

export const documentTypes: DocumentType[] = [
  {
    id: "requirements",
    title: "Project Requirements Document",
    description: "Detailed requirements specification based on your project idea",
    available: true
  },
  {
    id: "app_flow",
    title: "App Flow Document",
    description: "User journey and application flow documentation",
    available: false
  },
  {
    id: "tech_stack",
    title: "Tech Stack Document",
    description: "Recommended technology stack and architecture",
    available: false
  },
  {
    id: "frontend_guidelines",
    title: "Frontend Guidelines Document",
    description: "Frontend development standards and best practices",
    available: false
  },
  {
    id: "backend_structure",
    title: "Backend Structure Document",
    description: "Backend architecture and API design",
    available: false
  },
  {
    id: "file_structure",
    title: "File Structure Document",
    description: "Project file organization and naming conventions",
    available: false
  },
  {
    id: "implementation_plan",
    title: "Implementation Plan",
    description: "Step-by-step development and deployment plan",
    available: false
  }
];
