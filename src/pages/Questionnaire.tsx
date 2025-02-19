
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuestionInput } from "@/components/QuestionInput";
import { useQuestionnaireLogic } from "@/hooks/useQuestionnaireLogic";
import { Sparkles } from "lucide-react";

interface LocationState {
  appIdea: string;
  editMode?: boolean;
  questions?: string[];
  answers?: Record<number, string>;
}

const Questionnaire = () => {
  const location = useLocation();
  const locationState = location.state as LocationState;
  const appIdea = locationState?.appIdea;
  const isEditMode = locationState?.editMode;

  const {
    questions,
    answers,
    isLoading,
    isSaving,
    generatingAnswers,
    isGeneratingAll,
    handleAnswerChange,
    generateAnswer,
    generateAllAnswers,
    handleSubmit,
  } = useQuestionnaireLogic({
    appIdea,
    isEditMode,
    initialQuestions: locationState?.questions,
    initialAnswers: locationState?.answers,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600">Generating questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-900">Tell us more about your app</h2>
            <Button
              onClick={generateAllAnswers}
              disabled={isGeneratingAll || isSaving}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGeneratingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate All Answers
                </>
              )}
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question, index) => (
              <QuestionInput
                key={index}
                question={question}
                answer={answers[index] || ''}
                isGenerating={generatingAnswers[index] || false}
                onChange={(value) => handleAnswerChange(index, value)}
                onGenerateAnswer={() => generateAnswer(index)}
              />
            ))}
            
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isSaving || isGeneratingAll}
            >
              {isSaving ? 'Saving...' : 'Submit Answers'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
