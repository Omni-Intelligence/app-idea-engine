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
    question: "What problem does your application solve?",
    placeholder: "Describe the main problem your application addresses...",
    options: [
      { value: "efficiency", label: "Improves Efficiency" },
      { value: "automation", label: "Automates Tasks" },
      { value: "communication", label: "Enhances Communication" },
      { value: "analysis", label: "Provides Better Insights" },
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
  {
    question: "What's your preferred monetization strategy?",
    placeholder: "Describe how you plan to generate revenue...",
    options: [
      { value: "subscription", label: "Subscription Model" },
      { value: "freemium", label: "Freemium with Premium Features" },
      { value: "ads", label: "Advertisement Based" },
      { value: "pay-per-use", label: "Pay Per Use" },
    ]
  },
  {
    question: "What's your development timeline?",
    placeholder: "Describe your expected development timeline...",
    options: [
      { value: "quick", label: "1-3 Months (MVP)" },
      { value: "medium", label: "3-6 Months" },
      { value: "long", label: "6-12 Months" },
      { value: "ongoing", label: "Continuous Development" },
    ]
  },
  {
    question: "What's your technical expertise level?",
    placeholder: "Describe your technical background...",
    options: [
      { value: "beginner", label: "Beginner (New to Development)" },
      { value: "intermediate", label: "Intermediate (Some Experience)" },
      { value: "advanced", label: "Advanced (Experienced Developer)" },
      { value: "expert", label: "Expert (Professional Developer)" },
    ]
  },
  {
    question: "What's your preferred tech stack?",
    placeholder: "Describe your preferred technologies...",
    options: [
      { value: "modern-web", label: "Modern Web Stack (React, Node.js)" },
      { value: "traditional", label: "Traditional Stack (PHP, MySQL)" },
      { value: "cloud-native", label: "Cloud Native (AWS, Azure)" },
      { value: "mobile", label: "Mobile Development (React Native)" },
    ]
  },
  {
    question: "What's your scaling expectation?",
    placeholder: "Describe your expected user base growth...",
    options: [
      { value: "small", label: "Small Scale (< 1000 users)" },
      { value: "medium", label: "Medium Scale (1000-10000 users)" },
      { value: "large", label: "Large Scale (10000-100000 users)" },
      { value: "enterprise", label: "Enterprise Scale (100000+ users)" },
    ]
  }
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
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-left">
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