
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

const Questionnaire = () => {
  const { currentStep, answers, setAnswer, nextStep, previousStep } = useQuestionStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Store the initial idea when component mounts
  useEffect(() => {
    const initialIdea = (location.state as { initialIdea?: string })?.initialIdea;
    console.log("Initial idea from location state:", initialIdea); // Debug log
    if (initialIdea) {
      setAnswer('initial', initialIdea);
      console.log("Setting initial idea in store:", initialIdea); // Debug log
    }
  }, [location.state, setAnswer]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      useQuestionStore.getState().reset();
    };
  }, []);

  const handleSubmit = async (answer: string) => {
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
