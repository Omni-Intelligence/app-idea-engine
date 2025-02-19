
import { CheckCircle2, Loader2 } from "lucide-react";
import { DocumentType } from "@/types/documents";

interface DocumentTypeCardProps {
  docType: DocumentType;
  isGenerating: boolean;
  onGenerate: (docType: DocumentType) => void;
}

export const DocumentTypeCard = ({
  docType,
  isGenerating,
  onGenerate,
}: DocumentTypeCardProps) => {
  return (
    <div
      className={`p-4 rounded-lg border ${
        docType.available 
          ? 'bg-white hover:bg-gray-50 cursor-pointer'
          : 'bg-gray-50 opacity-75'
      }`}
      onClick={() => onGenerate(docType)}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {docType.available ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {docType.title}
          </h3>
          <p className="text-sm text-gray-500">
            {docType.description}
          </p>
        </div>
        {isGenerating && (
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
        )}
      </div>
    </div>
  );
};
