import { create } from 'zustand';

export interface QuizQuestion {
  id: string;
  course_code: string;
  segment_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
}

export interface QuizAnswer {
  question_id: string;
  user_answer: string | null;
  is_marked: boolean;
  time_spent: number;
}

export interface QuizAttempt {
  id?: string;
  course_code: string;
  segment_number: number;
  quiz_mode: 'practice' | 'exam' | 'quick';
  start_time: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
  questions: QuizQuestion[];
  answers: Map<string, QuizAnswer>;
}

interface QuizStore {
  currentAttempt: QuizAttempt | null;
  currentQuestionIndex: number;
  timeElapsed: number;
  isSubmitting: boolean;

  startQuiz: (courseCode: string, segmentNumber: number, questions: QuizQuestion[], mode?: 'practice' | 'exam' | 'quick') => void;
  setCurrentQuestion: (index: number) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  toggleMarkQuestion: (questionId: string) => void;
  updateQuestionTime: (questionId: string, seconds: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
  setTimeElapsed: (seconds: number) => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentAttempt: null,
  currentQuestionIndex: 0,
  timeElapsed: 0,
  isSubmitting: false,

  startQuiz: (courseCode, segmentNumber, questions, mode = 'practice') => {
    const answers = new Map<string, QuizAnswer>();
    questions.forEach((q) => {
      answers.set(q.id, {
        question_id: q.id,
        user_answer: null,
        is_marked: false,
        time_spent: 0,
      });
    });

    set({
      currentAttempt: {
        course_code: courseCode,
        segment_number: segmentNumber,
        quiz_mode: mode,
        start_time: new Date(),
        status: 'in_progress',
        questions,
        answers,
      },
      currentQuestionIndex: 0,
      timeElapsed: 0,
    });
  },

  setCurrentQuestion: (index) => {
    const { currentAttempt } = get();
    if (currentAttempt && index >= 0 && index < currentAttempt.questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  answerQuestion: (questionId, answer) => {
    const { currentAttempt } = get();
    if (!currentAttempt) return;

    const updatedAnswers = new Map(currentAttempt.answers);
    const currentAnswer = updatedAnswers.get(questionId);
    if (currentAnswer) {
      updatedAnswers.set(questionId, {
        ...currentAnswer,
        user_answer: answer,
      });
    }

    set({
      currentAttempt: {
        ...currentAttempt,
        answers: updatedAnswers,
      },
    });
  },

  toggleMarkQuestion: (questionId) => {
    const { currentAttempt } = get();
    if (!currentAttempt) return;

    const updatedAnswers = new Map(currentAttempt.answers);
    const currentAnswer = updatedAnswers.get(questionId);
    if (currentAnswer) {
      updatedAnswers.set(questionId, {
        ...currentAnswer,
        is_marked: !currentAnswer.is_marked,
      });
    }

    set({
      currentAttempt: {
        ...currentAttempt,
        answers: updatedAnswers,
      },
    });
  },

  updateQuestionTime: (questionId, seconds) => {
    const { currentAttempt } = get();
    if (!currentAttempt) return;

    const updatedAnswers = new Map(currentAttempt.answers);
    const currentAnswer = updatedAnswers.get(questionId);
    if (currentAnswer) {
      updatedAnswers.set(questionId, {
        ...currentAnswer,
        time_spent: currentAnswer.time_spent + seconds,
      });
    }

    set({
      currentAttempt: {
        ...currentAttempt,
        answers: updatedAnswers,
      },
    });
  },

  nextQuestion: () => {
    const { currentAttempt, currentQuestionIndex } = get();
    if (currentAttempt && currentQuestionIndex < currentAttempt.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  submitQuiz: async () => {
    set({ isSubmitting: true });
    set({ isSubmitting: false });
  },

  resetQuiz: () => {
    set({
      currentAttempt: null,
      currentQuestionIndex: 0,
      timeElapsed: 0,
      isSubmitting: false,
    });
  },

  setTimeElapsed: (seconds) => {
    set({ timeElapsed: seconds });
  },
}));
