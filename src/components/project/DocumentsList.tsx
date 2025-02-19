
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import type { DocumentDetails } from '@/types/project';

interface DocumentsListProps {
  documents: DocumentDetails[];
  onGenerateClick: () => void;
}

export const DocumentsList = ({ documents, onGenerateClick }: DocumentsListProps) => {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-purple-900">Generated Documents</h2>
        <Button 
          onClick={onGenerateClick} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Generate Documents
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <EmptyDocuments onGenerateClick={onGenerateClick} />
        ) : (
          documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))
        )}
      </div>
    </>
  );
};

const EmptyDocuments = ({ onGenerateClick }: { onGenerateClick: () => void }) => (
  <Card>
    <CardContent className="py-12">
      <div className="text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
        <p className="text-gray-600 mb-4">Start generating documents for your project!</p>
        <Button 
          onClick={onGenerateClick} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Generate Documents
        </Button>
      </div>
    </CardContent>
  </Card>
);

const DocumentCard = ({ document }: { document: DocumentDetails }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-purple-900">
        {document.document_type.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </CardTitle>
      <CardDescription>
        Generated {formatDistanceToNow(new Date(document.created_at))} ago
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="prose max-w-none">
        {document.content.split('\n').map((paragraph, index) => (
          <p key={index} className="text-gray-600 mb-2">{paragraph}</p>
        ))}
      </div>
    </CardContent>
  </Card>
);
