
import { DocumentItem } from "./DocumentItem";
import { FileText, Users, Code, Book, Cloud, TestTube, ShieldCheck, Wrench } from "lucide-react";
import { GeneratedDocument } from "./types";

interface DocumentSectionProps {
  documents: GeneratedDocument[];
  isGenerating: string | null;
  onGenerate: (type: string) => void;
  onView: (doc: GeneratedDocument) => void;
}

const documentTypeConfig = {
  technical_specs: {
    icon: FileText,
    label: 'Technical Specifications',
  },
  user_stories: {
    icon: Users,
    label: 'User Stories',
  },
  api_docs: {
    icon: Code,
    label: 'API Documentation',
  },
  implementation_guide: {
    icon: Book,
    label: 'Implementation Guide',
  },
  deployment_guide: {
    icon: Cloud,
    label: 'Deployment Guide',
  },
  testing_strategy: {
    icon: TestTube,
    label: 'Testing Strategy',
  },
  security_guidelines: {
    icon: ShieldCheck,
    label: 'Security Guidelines',
  },
  maintenance_docs: {
    icon: Wrench,
    label: 'Maintenance Documentation',
  },
} as const;

export const DocumentSection = ({
  documents,
  isGenerating,
  onGenerate,
  onView,
}: DocumentSectionProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Generate Documentation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(documentTypeConfig) as [string, typeof documentTypeConfig.technical_specs][]).map(([type, config]) => {
          const existingDoc = documents.find(doc => doc.document_type === type);
          
          return (
            <DocumentItem
              key={type}
              type={type}
              icon={config.icon}
              label={config.label}
              isGenerating={isGenerating === type}
              existingDoc={existingDoc}
              onGenerate={() => onGenerate(type)}
              onView={() => existingDoc && onView(existingDoc)}
            />
          );
        })}
      </div>
    </div>
  );
};
