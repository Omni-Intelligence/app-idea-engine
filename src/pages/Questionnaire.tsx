
import { useEffect, useState } from 'react';
import { useQuestionStore } from '@/store/questionStore';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { NavigationControls } from '@/components/NavigationControls';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfirmationPage } from '@/components/ConfirmationPage';
import { submitQuestionnaire } from '@/utils/questionnaireSubmission';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Questionnaire = () => {
  const { 
    currentStep, 
    answers, 
    setAnswer, 
    nextStep, 
    previousStep,
    dynamicQuestions,
    setDynamicQuestions
  } = useQuestionStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFullIdea, setShowFullIdea] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    const initialIdea = (location.state as { initialIdea?: string })?.initialIdea;
    if (initialIdea) {
      setAnswer('initial', initialIdea);
      generateQuestions(initialIdea);
    }
  }, [location.state, setAnswer]);

  useEffect(() => {
    return () => {
      useQuestionStore.getState().reset();
    };
  }, []);

  const generateQuestions = async (initialIdea: string) => {
    setIsGeneratingQuestions(true);
    try {
      // Create initial submission
      const { data: submission, error: submissionError } = await supabase
        .from('project_submissions')
        .insert([{ 
          initial_idea: initialIdea,
          project_idea: initialIdea,
          // Set default values for required fields
          target_audience: 'To be determined',
          problem_solved: 'To be determined',
          core_features: 'To be determined',
          ai_integration: 'To be determined',
          monetization: 'To be determined',
          development_timeline: 'To be determined',
          technical_expertise: 'To be determined',
          tech_stack: 'To be determined',
          scaling_expectation: 'To be determined'
        }])
        .select()
        .single();

      if (submissionError) throw submissionError;
      setSubmissionId(submission.id);

      // Generate questions
      const { error: generateError } = await supabase.functions.invoke('generate-questions', {
        body: { initialIdea, submissionId: submission.id }
      });

      if (generateError) throw generateError;

      // Fetch generated questions
      const { data: questions, error: fetchError } = await supabase
        .from('dynamic_questions')
        .select('*')
        .eq('submission_id', submission.id)
        .order('order_index');

      if (fetchError) throw fetchError;
      setDynamicQuestions(questions);

    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate project-specific questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

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

  const handleFinalSubmit = async () => {
    if (!submissionId) {
      toast({
        title: "Error",
        description: "No submission ID found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the submission with all answers
      const { error: updateError } = await supabase
        .from('project_submissions')
        .update({ 
          answers,
          status: 'completed'
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

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

  if (isGeneratingQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Generating Questions</h2>
          <p className="text-gray-600 mb-8">
            Please wait while we analyze your project idea and generate specific questions...
          </p>
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

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

  const currentQuestion = dynamicQuestions[currentStep];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Questions Available</h2>
          <p className="text-gray-600">
            Please start over and provide your initial project idea.
          </p>
          <Button onClick={() => navigate('/')} className="mt-6">
            Start Over
          </Button>
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
            {currentQuestion.question}
          </h2>
          <div className="mb-4">
            <ProgressBar currentStep={currentStep} totalSteps={dynamicQuestions.length} />
          </div>
          <QuestionCard
            question=""
            placeholder={currentQuestion.placeholder || "Type your answer here..."}
            options={currentQuestion.options || []}
            type={currentQuestion.type}
            allowMultiple={currentQuestion.type === 'multiple'}
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
