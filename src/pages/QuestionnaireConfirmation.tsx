
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface QuestionnaireData {
  appIdea: string;
  questions: string[];
  answers: Record<number, string>;
  projectId?: string;
}

const QuestionnaireConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionnaireData = location.state as QuestionnaireData;
  const projectId = questionnaireData?.projectId;

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
    navigate('/questionnaire', {
      state: {
        appIdea,
        editMode: true,
        questions,
        answers,
        projectId
      }
    });
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Create project and save responses
      const { data: project, error: projectError } = await supabase
        .from('user_projects')
        .upsert({
          user_id: user.id,
          title: appIdea.substring(0, 100),
          description: appIdea,
          project_idea: appIdea,
          status: 'draft',
          id: projectId
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('Failed to create project');

      // Save questionnaire responses
      const questionResponses = questions.map((question, index) => ({
        project_id: project.id,
        question,
        answer: answers[index] || '',
        question_order: index
      }));

      const { error: responsesError } = await supabase
        .from('questionnaire_responses')
        .insert(questionResponses);

      if (responsesError) throw responsesError;

      toast({
        title: "Success",
        description: "Project saved successfully!",
      });

      // Navigate to document generation with all data
      navigate('/generate-documents', {
        state: {
          appIdea,
          questions,
          answers,
          projectId: project.id
        }
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen  py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <h2 className="text-2xl font-bold text-primary">Review Your Responses</h2>
            <p className="text-gray-600">Please review your app details and responses below</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">App Idea</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{appIdea}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Your Responses</h3>
              {questions.map((question, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700 mb-2">{question}</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{answers[index]}</p>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4 bg-gray-50 rounded-b-lg pt-4 -mb-4 sticky bottom-0">
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
