
import { useEffect, useState } from 'react';
import { useQuestionStore } from '@/store/questionStore';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { NavigationControls } from '@/components/NavigationControls';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfirmationPage } from '@/components/ConfirmationPage';
import { questions } from '@/data/questionnaireData';
import { submitQuestionnaire } from '@/utils/questionnaireSubmission';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Questionnaire = () => {
  const { currentStep, answers, setAnswer, nextStep, previousStep } = useQuestionStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFullIdea, setShowFullIdea] = useState(false);

  useEffect(() => {
    const initialIdea = (location.state as { initialIdea?: string })?.initialIdea;
    if (initialIdea) {
      setAnswer('initial', initialIdea);
    }
  }, [location.state, setAnswer]);

  useEffect(() => {
    return () => {
      useQuestionStore.getState().reset();
    };
  }, []);

  const handleSubmit = async (answer: string | string[]) => {
    setAnswer(currentStep, answer);
    
    if (currentStep < questions.length - 1) {
      nextStep();
    } else {
      setShowConfirmation(true);
    }
  };

  const handleConfirmationBack = () => {
    setShowConfirmation(false);
    previousStep();
  };

  const handleFinalSubmit = async () => {
    try {
      const submissionId = await submitQuestionnaire(answers);
      navigate(`/analysis/${submissionId}`);
      return submissionId;
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire",
        variant: "destructive",
      });
      throw error;
    }
  };

  const renderInitialIdeaPreview = () => {
    const initialAnswer = answers.initial;
    if (!initialAnswer) return null;

    const displayText = typeof initialAnswer === 'string' 
      ? (initialAnswer.length > 100 ? `${initialAnswer.substring(0, 100)}...` : initialAnswer)
      : initialAnswer.join(', ');

    return (
      <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-purple-900 mb-1">Your Initial Project Idea:</h3>
            <p className="text-sm text-purple-800">
              {showFullIdea ? (typeof initialAnswer === 'string' ? initialAnswer : initialAnswer.join(', ')) : displayText}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            onClick={() => setShowFullIdea(!showFullIdea)}
          >
            {showFullIdea ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-white">
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-5xl">
            <ConfirmationPage
              answers={answers}
              onSubmit={handleFinalSubmit}
              onBack={handleConfirmationBack}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-white">
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-5xl">
          {renderInitialIdeaPreview()}
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-left purple-gradient text-gradient">
            {questions[currentStep].question}
          </h2>
          <div className="mb-4">
            <ProgressBar currentStep={currentStep} totalSteps={questions.length} />
          </div>
          <QuestionCard
            question=""
            placeholder={questions[currentStep].placeholder}
            options={questions[currentStep].options}
            type={questions[currentStep].type}
            allowMultiple={questions[currentStep].allowMultiple}
            onSubmit={handleSubmit}
          />
          {currentStep > 0 && (
            <div className="flex justify-end mt-6">
              <NavigationControls
                onBack={previousStep}
                showBack={currentStep > 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;

