import { useState } from "react";
import { GeneratedDocument } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy, FileText, Clock, Plus, Loader2, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import MarkdownRenderer from '@/components/MarkdownRenderer.tsx';
import { DocumentType, documentTypes } from "@/types/documents";
import { useDocumentGeneration } from "@/hooks/useDocumentGeneration";

interface GeneratedDocumentsProps {
  documents: GeneratedDocument[];
  projectId: string;
  onGenerateDocument?: (type: DocumentType) => void;
  onGeneretedDocumentEvent?: (doc: GeneratedDocument) => void;
}

export const GeneratedDocuments = ({ documents, onGenerateDocument, projectId, onGeneretedDocumentEvent }: GeneratedDocumentsProps) => {
  const { toast } = useToast();
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  const toggleDocument = (docId: string) => {
    setExpandedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const getPreviewContent = (content: string) => {
    const plainText = content.replace(/[#*`_~]/g, '');
    return plainText.slice(0, 200);
  };

  const copyToClipboard = async (content: string, documentType: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${documentType} has been copied to clipboard`,
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getExistingDocument = (type: DocumentType) => {
    return documents.find(doc => doc.document_type === type?.id);
  };

  const formatDocumentType = (type: DocumentType) => {
    return type.toString().replace('_', ' ');
  };

  const isComplexDocument = (type: DocumentType) => {
    return type.toString().split('_').length > 1;
  };

  const { generatingDoc, isGeneratingAll, generateDocument, generateAllDocuments } = useDocumentGeneration(projectId, (docType: DocumentType) => {
    if (onGeneretedDocumentEvent && docType) {
      onGeneretedDocumentEvent(docType);
    }
  });



  return (
    <Card className="border-0" id="generated-documents">
      <CardHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium text-gray-900">Generated Documents</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>{documents.length} document{documents.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
          <Button
            onClick={generateAllDocuments}
            disabled={isGeneratingAll}
          >
            <Play className="w-4 h-4 " />
            Generate All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {documentTypes.map((docType) => {
          const existingDoc = getExistingDocument(docType);

          if (existingDoc) {
            return (
              <div
                key={existingDoc.id}
                className="group relative bg-white border rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-success/10">
                      <FileText className="size-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {existingDoc?.document_type}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Generated {new Date(existingDoc.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(existingDoc.content, docType.toString())}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="whitespace-pre-wrap prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded p-3">
                    {expandedDocs[existingDoc.id] ? (
                      <MarkdownRenderer content={existingDoc.content} />
                    ) : (
                      <>
                        {getPreviewContent(existingDoc.content)}
                        {existingDoc.content.length > 200 && (
                          <span className="text-gray-400">...</span>
                        )}
                      </>
                    )}
                  </div>

                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>Word count: {existingDoc.content.split(/\s+/).length}</span>
                      <span>•</span>
                      <span>Characters: {existingDoc.content.length}</span>
                    </div>
                    {existingDoc.content.length > 200 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDocument(existingDoc.id)}
                      >
                        {expandedDocs[existingDoc.id] ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
                            Read More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={docType.id}
              className="group relative bg-white border border-dashed rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-gray-50">
                    <FileText className="size-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 capitalize">
                      {docType.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Not generated yet
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => generateDocument(docType)}
                  disabled={generatingDoc === docType.id}
                >
                  {generatingDoc === docType.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin text-amber-500" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                  Generate
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
