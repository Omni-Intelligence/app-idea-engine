import { useQuestionStore } from '@/store/questionStore';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { NavigationControls } from '@/components/NavigationControls';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    question: "Let's start with your project idea. What do you want to build?",
    placeholder: "Describe your project idea in detail...",
  },
  {
    question: "Who is your target audience?",
    placeholder: "Describe who will use your application...",
  },
  {
    question: "What are the core features you need?",
    placeholder: "List the main features your application should have...",
  },
  {
    question: "How would you like to integrate AI into your project?",
    placeholder: "Describe how AI could enhance your application...",
  },
];

const Questionnaire = () => {
  const navigate = useNavigate();
  const { currentStep, setAnswer, nextStep, previousStep } = useQuestionStore();

  const handleSubmit = (answer: string) => {
    setAnswer(currentStep, answer);
    if (currentStep < questions.length - 1) {
      nextStep();
    } else {
      // Handle completion
      console.log('Questionnaire completed');
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <ProgressBar currentStep={currentStep} totalSteps={questions.length} />
      <QuestionCard
        question={questions[currentStep].question}
        placeholder={questions[currentStep].placeholder}
        onSubmit={handleSubmit}
      />
      <NavigationControls
        onBack={previousStep}
        showBack={currentStep > 0}
      />
    </div>
  );
};

export default Questionnaire;