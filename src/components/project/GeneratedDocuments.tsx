
import { GeneratedDocument } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GeneratedDocumentsProps {
  documents: GeneratedDocument[];
}

export const GeneratedDocuments = ({ documents }: GeneratedDocumentsProps) => {
  if (!documents.length) return null;

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
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm">
              {doc.content}
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
