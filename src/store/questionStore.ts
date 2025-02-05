import { create } from 'zustand';

interface QuestionState {
  currentStep: number;
  answers: Record<string, string>;
  setAnswer: (step: number, answer: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

export const useQuestionStore = create<QuestionState>((set) => ({
  currentStep: 0,
  answers: {},
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
    }),
}));