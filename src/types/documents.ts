
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
    id: "detailed_project_requirements",
    title: "Project Requirements Document",
    description: "Detailed requirements specification based on your project idea",
    available: true
  },
  {
    id: "user_journey_and_app_flow",
    title: "App Flow Document",
    description: "User journey and application flow documentation",
    available: true
  },
  {
    id: "recommended_technology_stack",
    title: "Tech Stack Document",
    description: "Recommended technology stack and architecture",
    available: true
  },
  {
    id: "frontend_development_guidelines",
    title: "Frontend Guidelines Document",
    description: "Frontend development standards and best practices",
    available: true
  },
  {
    id: "backend_architecture_and_api",
    title: "Backend Structure Document",
    description: "Backend architecture and API design",
    available: true
  },
  {
    id: "project_file_organization",
    title: "File Structure Document",
    description: "Project file organization and naming conventions",
    available: true
  },
  {
    id: "project_implementation_plan",
    title: "Implementation Plan",
    description: "Step-by-step development and deployment plan",
    available: true
  }
];
