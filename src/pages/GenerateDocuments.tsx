
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface DocumentGenerationData {
  appIdea: string;
  questions: string[];
  answers: Record<number, string>;
}

const GenerateDocuments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate the location state
  const data = location.state as DocumentGenerationData;

  if (!data?.appIdea || !data?.questions || !data?.answers) {
    toast({
      title: "Error",
      description: "Missing required data. Please start over.",
      variant: "destructive",
    });
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <h2 className="text-2xl font-bold text-purple-900">Generate Documents</h2>
            <p className="text-gray-600">Choose the type of documents you'd like to generate</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-700">Document generation functionality coming soon...</p>
            
            <div className="flex justify-end">
              <Button
                onClick={() => navigate('/questionnaire-confirmation')}
                variant="outline"
                className="mr-4"
              >
                Back to Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateDocuments;
