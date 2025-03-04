export interface DocumentGenerationData {
  appIdea: string;
  questions: string[];
  answers: string[];
  projectId: string;
  existingDocuments: string[];
  document_type: string;
}

export type DocumentType = {
  id: string;
  title: string;
  description: string;
  available: boolean;
};

export const documentTypes: DocumentType[] = [
  {
    id: "Project Requirements Document",
    title: "Project Requirements Document",
    description: "Detailed requirements specification based on your project idea",
    available: true
  },
  {
    id: "App Flow Document",
    title: "App Flow Document",
    description: "User journey and application flow documentation",
    available: true
  },
  {
    id: "Tech Stack Document",
    title: "Tech Stack Document",
    description: "Recommended technology stack and architecture",
    available: true
  },
  {
    id: "Frontend Guidelines Document",
    title: "Frontend Guidelines Document",
    description: "Frontend development standards and best practices",
    available: true
  },
  {
    id: "Backend Structure Document",
    title: "Backend Structure Document",
    description: "Backend architecture and API design",
    available: true
  },
  {
    id: "File Structure Document",
    title: "File Structure Document",
    description: "Project file organization and naming conventions",
    available: true
  },
  {
    id: "Implementation Plan",
    title: "Implementation Plan",
    description: "Step-by-step development and deployment plan",
    available: true
  }
];
