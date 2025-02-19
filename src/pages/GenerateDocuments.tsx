
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, PlusCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentGenerationData {
  appIdea: string;
  questions: string[];
  answers: Record<string, any>;
  projectId: string;
}

type DocumentType = {
  id: string;
  title: string;
  description: string;
  available: boolean;
};

const documentTypes: DocumentType[] = [
  {
    id: "requirements",
    title: "Project Requirements Document",
    description: "Detailed requirements specification based on your project idea",
    available: true
  },
  {
    id: "app_flow",
    title: "App Flow Document",
    description: "User journey and application flow documentation",
    available: true
  },
  {
    id: "tech_stack",
    title: "Tech Stack Document",
    description: "Recommended technology stack and architecture",
    available: true
  },
  {
    id: "frontend_guidelines",
    title: "Frontend Guidelines Document",
    description: "Frontend development standards and best practices",
    available: true
  },
  {
    id: "backend_structure",
    title: "Backend Structure Document",
    description: "Backend architecture and API design",
    available: true
  },
  {
    id: "file_structure",
    title: "File Structure Document",
    description: "Project file organization and naming conventions",
    available: true
  },
  {
    id: "implementation_plan",
    title: "Implementation Plan",
    description: "Step-by-step development and deployment plan",
    available: true
  }
];

const GenerateDocuments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);

  const data = location.state as DocumentGenerationData;

  if (!data?.appIdea || !data?.questions || !data?.answers || !data?.projectId) {
    toast({
      title: "Error",
      description: "Missing required data. Please start over.",
      variant: "destructive",
    });
    navigate('/');
    return null;
  }

  const handleGenerateDocument = async (docType: DocumentType) => {
    if (!docType.available) {
      toast({
        title: "Coming Soon",
        description: "This document type will be available soon!",
      });
      return;
    }

    setGeneratingDoc(docType.id);
    try {
      // Convert dash to underscore for function name
      const functionName = `generate_${docType.id.replace('-', '_')}`;
      
      console.log('Calling edge function:', functionName, {
        projectId: data.projectId
      });

      const { data: generatedDoc, error } = await supabase.functions.invoke(functionName, {
        body: {
          projectId: data.projectId
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!generatedDoc) {
        throw new Error('No document generated');
      }

      console.log('Generated document:', generatedDoc);

      toast({
        title: "Success",
        description: `${docType.title} has been generated!`,
      });

      // Navigate back to project details
      navigate(`/project/${data.projectId}`);

    } catch (error: any) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingDoc(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <h2 className="text-2xl font-bold text-purple-900">Generate Documents</h2>
            <p className="text-gray-600">Select the documents you'd like to generate for your project</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {documentTypes.map((docType) => (
                <div
                  key={docType.id}
                  className={`p-4 rounded-lg border ${
                    docType.available 
                      ? 'bg-white hover:bg-gray-50 cursor-pointer'
                      : 'bg-gray-50 opacity-75'
                  }`}
                  onClick={() => handleGenerateDocument(docType)}
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
                    {generatingDoc === docType.id && (
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    )}
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <PlusCircle className="h-5 w-5" />
                  <span>Custom Document (Coming Soon)</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="mr-4"
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateDocuments;
