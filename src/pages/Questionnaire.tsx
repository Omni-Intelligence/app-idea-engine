import { useQuestionStore } from '@/store/questionStore';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { NavigationControls } from '@/components/NavigationControls';

const questions = [
  {
    question: "Let's start with your project idea. What do you want to build?",
    placeholder: "Describe your project idea in detail...",
    options: [
      { value: "web-app", label: "Web Application" },
      { value: "mobile-app", label: "Mobile Application" },
      { value: "ai-tool", label: "AI-powered Tool" },
      { value: "automation", label: "Automation Solution" },
    ]
  },
  {
    question: "Who is your target audience?",
    placeholder: "Describe who will use your application...",
    options: [
      { value: "businesses", label: "Businesses (B2B)" },
      { value: "consumers", label: "Consumers (B2C)" },
      { value: "developers", label: "Developers" },
      { value: "professionals", label: "Industry Professionals" },
    ]
  },
  {
    question: "What are the core features you need?",
    placeholder: "List the main features your application should have...",
    options: [
      { value: "auth", label: "User Authentication & Profiles" },
      { value: "data", label: "Data Processing & Analytics" },
      { value: "collab", label: "Collaboration Tools" },
      { value: "integration", label: "Third-party Integrations" },
    ]
  },
  {
    question: "How would you like to integrate AI into your project?",
    placeholder: "Describe how AI could enhance your application...",
    options: [
      { value: "nlp", label: "Natural Language Processing" },
      { value: "cv", label: "Computer Vision" },
      { value: "recommendation", label: "Recommendation System" },
      { value: "automation", label: "Process Automation" },
    ]
  },
];

const Questionnaire = () => {
  const { currentStep, setAnswer, nextStep, previousStep } = useQuestionStore();

  const handleSubmit = (answer: string) => {
    setAnswer(currentStep, answer);
    if (currentStep < questions.length - 1) {
      nextStep();
    } else {
      console.log('Questionnaire completed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 md:mb-10 text-left">
            {questions[currentStep].question}
          </h2>
          <div className="mb-4">
            <ProgressBar currentStep={currentStep} totalSteps={questions.length} />
          </div>
          <div className="relative">
            {currentStep > 0 && (
              <div className="absolute -top-12 right-0">
                <NavigationControls
                  onBack={previousStep}
                  showBack={currentStep > 0}
                />
              </div>
            )}
            <QuestionCard
              question=""
              placeholder={questions[currentStep].placeholder}
              options={questions[currentStep].options}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;