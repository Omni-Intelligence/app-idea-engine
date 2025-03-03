import { CheckCircle2, Loader2, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentType } from "@/types/documents";

interface DocumentTypeCardProps {
  docType: DocumentType;
  isGenerating: boolean;
  onGenerate: (docType: DocumentType) => Promise<boolean>;
  existingDocument: boolean;
}

export const DocumentTypeCard = ({
  docType,
  isGenerating,
  onGenerate,
  existingDocument,
}: DocumentTypeCardProps) => {
  return (
    <div
      className={`p-4 rounded-lg border ${docType.available
        ? 'bg-white hover:bg-gray-50'
        : 'bg-gray-50 opacity-75'
        }`}
    >
      <div className="flex items-start justify-between space-x-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            {existingDocument ? (
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
        </div>
        <div className="flex-shrink-0">
          {isGenerating ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : (
            <Button
              onClick={() => onGenerate(docType)}
              disabled={!docType.available}
              size="icon"
              variant={existingDocument ? 'outline' : 'default'}

            >
              {existingDocument ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
