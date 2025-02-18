
import { useState } from 'react';
import { DynamicQuestion } from '@/store/questionStore';

const defaultQuestions: DynamicQuestion[] = [
  {
    id: 'q1',
    question: 'What type of application is this? (Web, Mobile, Desktop)',
    type: 'text',
    placeholder: 'Enter the type of application',
    order_index: 0
  },
  {
    id: 'q2',
    question: 'Who is your target audience?',
    type: 'text',
    placeholder: 'Describe your target users',
    order_index: 1
  },
  {
    id: 'q3',
    question: 'What problem does your application solve?',
    type: 'text',
    placeholder: 'Describe the main problem your app addresses',
    order_index: 2
  },
  {
    id: 'q4',
    question: 'What are the core features of your application?',
    type: 'text',
    placeholder: 'List the main features',
    order_index: 3
  },
  {
    id: 'q5',
    question: 'How do you plan to integrate AI into your application?',
    type: 'text',
    placeholder: 'Describe your AI integration plans',
    order_index: 4
  }
];

export const useQuestionGeneration = (setDynamicQuestions: (questions: DynamicQuestion[]) => void) => {
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const generateQuestions = async (initialIdea: string) => {
    setIsGeneratingQuestions(true);
    try {
      // Simply set the default questions
      setDynamicQuestions(defaultQuestions);
      return true;
    } catch (error) {
      console.error('Error setting questions:', error);
      return false;
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return {
    generateQuestions,
    isGeneratingQuestions
  };
};
