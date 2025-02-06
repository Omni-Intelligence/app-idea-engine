
import { create } from 'zustand';

interface DynamicQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple';
  placeholder?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  order_index: number;
}

interface QuestionState {
  currentStep: number;
  answers: Record<string | number, string | string[]>;
  dynamicQuestions: DynamicQuestion[];
  setDynamicQuestions: (questions: DynamicQuestion[]) => void;
  setAnswer: (step: number | string, answer: string | string[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

export const useQuestionStore = create<QuestionState>((set) => ({
  currentStep: 0,
  answers: {},
  dynamicQuestions: [],
  setDynamicQuestions: (questions) => set({ dynamicQuestions: questions.map(q => ({
    ...q,
    type: q.type === 'multiple' ? 'multiple' : 'text' // Ensure type is either 'text' or 'multiple'
  }))}),
  setAnswer: (step, answer) =>
    set((state) => ({
      answers: { ...state.answers, [step]: answer },
    })),
  nextStep: () =>
    set((state) => ({
      currentStep: state.currentStep + 1,
    })),
  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(0, state.currentStep - 1),
    })),
  reset: () =>
    set({
      currentStep: 0,
      answers: {},
      dynamicQuestions: [],
    }),
}));
