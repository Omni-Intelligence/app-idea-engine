
import { DynamicQuestion } from '@/store/questionStore';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { NavigationControls } from '@/components/NavigationControls';
import { InitialIdeaPreview } from './InitialIdeaPreview';

interface QuestionnaireContentProps {
  currentQuestion: DynamicQuestion;
  currentStep: number;
  totalSteps: number;
  onSubmit: (answer: string | string[]) => void;
  onBack: () => void;
  initialAnswer: string | string[];
}

export const QuestionnaireContent = ({
  currentQuestion,
  currentStep,
  totalSteps,
  onSubmit,
  onBack,
  initialAnswer,
}: QuestionnaireContentProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-white">
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-5xl">
          <InitialIdeaPreview initialAnswer={initialAnswer} />
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-left purple-gradient text-gradient">
            {currentQuestion.question}
          </h2>
          <div className="mb-4">
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          </div>
          <QuestionCard
            question=""
            placeholder={currentQuestion.placeholder || "Type your answer here..."}
            options={currentQuestion.options || []}
            type={currentQuestion.type}
            allowMultiple={currentQuestion.type === 'multiple'}
            onSubmit={onSubmit}
          />
          {currentStep > 0 && (
            <div className="flex justify-end mt-6">
              <NavigationControls
                onBack={onBack}
                showBack={currentStep > 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
