
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoadingState } from "@/components/analysis/LoadingState";
import { DocumentSection } from "@/components/analysis/DocumentSection";
import { DocumentViewer } from "@/components/analysis/DocumentViewer";
import { GeneratedDocument, DocumentType } from "@/components/analysis/types";
import { useEffect } from "react";

const AnalysisResults = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState<DocumentType | null>(null);
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
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load generated documents.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data, error } = await supabase
          .from('project_submissions')
          .select('ai_analysis')
          .eq('id', submissionId)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.ai_analysis) {
          setAnalysis(data.ai_analysis);
          setIsLoading(false);
          await fetchDocuments();
        } else {
          // If analysis is not ready, poll every 2 seconds
          const interval = setInterval(async () => {
            const { data: updatedData, error: pollError } = await supabase
              .from('project_submissions')
              .select('ai_analysis')
              .eq('id', submissionId)
              .maybeSingle();

            if (pollError) throw pollError;

            if (updatedData?.ai_analysis) {
              setAnalysis(updatedData.ai_analysis);
              setIsLoading(false);
              await fetchDocuments();
              clearInterval(interval);
            }
          }, 2000);

          // Cleanup interval
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast({
          title: "Error",
          description: "Failed to load analysis results. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    if (submissionId) {
      fetchAnalysis();
    }
  }, [submissionId, toast]);

  const handleGenerateDocument = async (type: DocumentType) => {
    if (!submissionId) return;

    setIsGenerating(type);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          documentType: type,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

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

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-6">
        <h2 className="text-2xl font-semibold mb-6">Your Project Analysis</h2>
        {analysis ? (
          <>
            <div className="prose max-w-none mb-8">
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
            
            <DocumentSection
              documents={documents}
              isGenerating={isGenerating}
              onGenerate={handleGenerateDocument}
              onView={setSelectedDocument}
            />
          </>
        ) : (
          <p className="text-gray-600">No analysis available. Please try again later.</p>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleBackToHome}>Back to Home</Button>
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

export default AnalysisResults;
