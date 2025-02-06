
import { useEffect } from 'react';
import { useQuestionStore } from '@/store/questionStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConfirmationPage } from '@/components/ConfirmationPage';
import { LoadingState } from '@/components/questionnaire/LoadingState';
import { ErrorState } from '@/components/questionnaire/ErrorState';
import { QuestionnaireContent } from '@/components/questionnaire/QuestionnaireContent';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { useQuestionnaireSubmission } from '@/hooks/useQuestionnaireSubmission';

const Questionnaire = () => {
  const { 
    currentStep, 
    answers, 
    setAnswer, 
    nextStep, 
    previousStep,
    dynamicQuestions,
    setDynamicQuestions,
    reset 
  } = useQuestionStore();

  const location = useLocation();
  const { 
    generateQuestions, 
    isGeneratingQuestions, 
    submissionId 
  } = useQuestionGeneration(setDynamicQuestions);

  const {
    showConfirmation,
    setShowConfirmation,
    handleSubmit: handleFinalSubmit
  } = useQuestionnaireSubmission();

  useEffect(() => {
    const initialIdea = (location.state as { initialIdea?: string })?.initialIdea;
    if (initialIdea) {
      setAnswer('initial', initialIdea);
      generateQuestions(initialIdea);
    }
  }, [location.state, setAnswer]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleSubmit = async (answer: string | string[]) => {
    setAnswer(currentStep, answer);
    
    if (currentStep < dynamicQuestions.length) {
      nextStep();
    } else {
      setShowConfirmation(true);
    }
  };

  const handleConfirmationBack = () => {
    setShowConfirmation(false);
    previousStep();
  };

  if (isGeneratingQuestions) {
    return <LoadingState />;
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-white">
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-5xl">
            <ConfirmationPage
              answers={answers}
              onSubmit={() => submissionId ? handleFinalSubmit(submissionId, answers) : Promise.reject()}
              onBack={handleConfirmationBack}
            />
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = dynamicQuestions[currentStep];

  if (!currentQuestion) {
    return <ErrorState />;
  }

  return (
    <QuestionnaireContent
      currentQuestion={currentQuestion}
      currentStep={currentStep}
      totalSteps={dynamicQuestions.length}
      onSubmit={handleSubmit}
      onBack={previousStep}
      initialAnswer={answers.initial}
    />
  );
};

export default Questionnaire;
