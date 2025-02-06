
import { useEffect, useState } from 'react';
import { useQuestionStore, DynamicQuestion } from '@/store/questionStore';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfirmationPage } from '@/components/ConfirmationPage';
import { submitQuestionnaire } from '@/utils/questionnaireSubmission';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/questionnaire/LoadingState';
import { ErrorState } from '@/components/questionnaire/ErrorState';
import { QuestionnaireContent } from '@/components/questionnaire/QuestionnaireContent';

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
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
      reset();
    };
  }, [reset]);

  const generateQuestions = async (initialIdea: string) => {
    setIsGeneratingQuestions(true);
    try {
      const { data: submission, error: submissionError } = await supabase
        .from('project_submissions')
        .insert([{ 
          initial_idea: initialIdea,
          project_idea: initialIdea,
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

      const { error: generateError } = await supabase.functions.invoke('generate-questions', {
        body: { initialIdea, submissionId: submission.id }
      });

      if (generateError) throw generateError;

      const { data: questions, error: fetchError } = await supabase
        .from('dynamic_questions')
        .select('*')
        .eq('submission_id', submission.id)
        .order('order_index');

      if (fetchError) throw fetchError;
      
      const typedQuestions = questions?.map(q => ({
        ...q,
        type: q.type === 'multiple' ? 'multiple' : 'text',
        options: q.options as Array<{ value: string; label: string; }> | undefined
      })) as DynamicQuestion[];
      
      setDynamicQuestions(typedQuestions);

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

  type SubmissionAnswers = {
    [key: string]: string;
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
      // Process answers to ensure all values are strings
      const processedAnswers: SubmissionAnswers = {};
      Object.entries(answers).forEach(([key, value]) => {
        processedAnswers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      });

      const { error: updateError } = await supabase
        .from('project_submissions')
        .update({ 
          answers: processedAnswers,
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
