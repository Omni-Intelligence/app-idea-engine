
import { useState } from "react";
import { GeneratedDocument } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface GeneratedDocumentsProps {
  documents: GeneratedDocument[];
}

export const GeneratedDocuments = ({ documents }: GeneratedDocumentsProps) => {
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  if (!documents.length) return null;

  const toggleDocument = (docId: string) => {
    setExpandedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const getPreviewContent = (content: string) => {
    // Remove any markdown formatting
    const plainText = content.replace(/[#*`_~]/g, '');
    // Get first 200 characters
    return plainText.slice(0, 200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2 text-purple-900 capitalize">
              {doc.document_type.replace('_', ' ')}
            </h3>
            <div className="space-y-2">
              <div className="whitespace-pre-wrap text-sm">
                {expandedDocs[doc.id] ? (
                  doc.content.replace(/[#*`_~]/g, '')
                ) : (
                  <>
                    {getPreviewContent(doc.content)}
                    {doc.content.length > 200 && "..."}
                  </>
                )}
              </div>
              {doc.content.length > 200 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDocument(doc.id)}
                  className="mt-2 w-full flex items-center justify-center"
                >
                  {expandedDocs[doc.id] ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Read More
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Generated on {new Date(doc.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
