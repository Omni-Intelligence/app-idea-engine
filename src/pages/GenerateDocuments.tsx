
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";
import { DocumentTypeCard } from "@/components/documents/DocumentTypeCard";
import { useDocumentGeneration } from "@/hooks/useDocumentGeneration";
import { DocumentGenerationData, documentTypes } from "@/types/documents";

const GenerateDocuments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const { generatingDoc, generateDocument } = useDocumentGeneration(data.projectId);

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
                <DocumentTypeCard
                  key={docType.id}
                  docType={docType}
                  isGenerating={generatingDoc === docType.id}
                  onGenerate={generateDocument}
                />
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
