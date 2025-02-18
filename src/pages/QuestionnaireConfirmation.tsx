
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface QuestionnaireData {
  appIdea: string;
  questions: string[];
  answers: Record<number, string>;
}

const QuestionnaireConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the location state
  const questionnaireData = location.state as QuestionnaireData;

  // Redirect if no data is provided
  if (!questionnaireData?.appIdea || !questionnaireData?.questions || !questionnaireData?.answers) {
    toast({
      title: "Error",
      description: "Missing questionnaire data. Please start over.",
      variant: "destructive",
    });
    navigate('/');
    return null;
  }

  const { appIdea, questions, answers } = questionnaireData;

  const handleEdit = () => {
    navigate('/questionnaire', { state: { appIdea, editMode: true, questions, answers } });
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Navigate to document generation page with the questionnaire data
      navigate('/generate-documents', { 
        state: { 
          appIdea,
          questions,
          answers
        } 
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to proceed. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <h2 className="text-2xl font-bold text-purple-900">Review Your Responses</h2>
            <p className="text-gray-600">Please review your app details and responses below</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">App Idea</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{appIdea}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-800">Your Responses</h3>
              {questions.map((question, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700 mb-2">{question}</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{answers[index]}</p>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4 bg-gray-50 rounded-b-lg">
            <Button
              variant="outline"
              onClick={handleEdit}
              disabled={isSubmitting}
            >
              Edit Responses
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Processing..." : "Generate Documents"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default QuestionnaireConfirmation;
