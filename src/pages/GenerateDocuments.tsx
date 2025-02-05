
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoadingState } from "@/components/analysis/LoadingState";
import { DocumentSection } from "@/components/analysis/DocumentSection";
import { DocumentViewer } from "@/components/analysis/DocumentViewer";
import { GeneratedDocument, DocumentType } from "@/components/analysis/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NavigationControls } from "@/components/NavigationControls";

const GenerateDocuments = () => {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState<DocumentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedDocuments: GeneratedDocument[] = data?.map(doc => ({
        id: doc.id,
        document_type: doc.document_type as DocumentType,
        content: doc.content,
        status: doc.status as 'pending' | 'completed',
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        submission_id: doc.submission_id,
        user_id: doc.user_id
      })) || [];
      
      setDocuments(typedDocuments);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load generated documents.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      fetchDocuments();
    }
  }, [submissionId]);

  const handleGenerateDocument = async (type: DocumentType) => {
    if (!submissionId) return;

    setIsGenerating(type);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: {
          submissionId,
          documentType: type,
          userId: user.id,
        },
      });

      if (error) throw error;

      await fetchDocuments();
      toast({
        title: "Success",
        description: "Document generated successfully!",
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleBack = () => {
    navigate(`/analysis/${submissionId}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
          <h2 className="text-2xl font-semibold">Generate Documentation</h2>
        </div>
        
        <DocumentSection
          documents={documents}
          isGenerating={isGenerating}
          onGenerate={handleGenerateDocument}
          onView={setSelectedDocument}
        />

        <div className="mt-6">
          <NavigationControls 
            onBack={handleBack}
            showBack={true}
          />
        </div>
      </Card>

      <DocumentViewer
        document={selectedDocument}
        documentLabel={selectedDocument?.document_type ? 
          selectedDocument.document_type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : 
          ''}
        open={!!selectedDocument}
        onOpenChange={() => setSelectedDocument(null)}
      />
    </div>
  );
};

export default GenerateDocuments;
