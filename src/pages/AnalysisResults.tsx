
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, Code, Users, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DocumentType = 'technical_specs' | 'user_stories' | 'api_docs' | 'implementation_guide';

interface GeneratedDocument {
  id: string;
  document_type: DocumentType;
  content: string;
  status: 'pending' | 'completed';
  created_at?: string;
  updated_at?: string;
  submission_id?: string;
  user_id?: string;
}

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
      
      // Cast the data to ensure it matches our GeneratedDocument type
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
  } as const;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <h2 className="text-2xl font-semibold">Analyzing Your Project...</h2>
            <p className="text-gray-600">Please wait while our AI analyzes your project details.</p>
          </div>
        </Card>
      </div>
    );
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
            
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Generate Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(documentTypeConfig) as [DocumentType, typeof documentTypeConfig.technical_specs][]).map(([type, config]) => {
                  const existingDoc = documents.find(doc => doc.document_type === type);
                  const Icon = config.icon;
                  
                  return (
                    <div key={type} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Icon className="h-6 w-6 text-gray-500" />
                      <div className="flex-1">
                        <h4 className="font-medium">{config.label}</h4>
                      </div>
                      {existingDoc ? (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedDocument(existingDoc)}
                        >
                          View
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleGenerateDocument(type)}
                          disabled={!!isGenerating}
                        >
                          {isGenerating === type ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate'
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-600">No analysis available. Please try again later.</p>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleBackToHome}>Back to Home</Button>
        </div>
      </Card>

      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedDocument && documentTypeConfig[selectedDocument.document_type].label}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">
                {selectedDocument?.content}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisResults;
