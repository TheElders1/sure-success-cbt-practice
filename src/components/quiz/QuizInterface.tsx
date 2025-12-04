import { useState, useEffect } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';
import QuizTimer from './QuizTimer';
import QuizProgress from './QuizProgress';
import QuestionCard from './QuestionCard';
import QuizNavigation from './QuizNavigation';
import Button from '../ui/Button';

interface QuizInterfaceProps {
  onComplete: (score: number, totalQuestions: number) => void;
}

export default function QuizInterface({ onComplete }: QuizInterfaceProps) {
  const { currentAttempt } = useQuizStore();
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const questionIndex = parseInt(e.key) - 1;
        const currentQuestion = currentAttempt?.questions[
          useQuizStore.getState().currentQuestionIndex
        ];
        if (currentQuestion && questionIndex < currentQuestion.options.length) {
          useQuizStore.getState().answerQuestion(
            currentQuestion.id,
            currentQuestion.options[questionIndex]
          );
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        useQuizStore.getState().nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        useQuizStore.getState().previousQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentAttempt]);

  if (!currentAttempt) return null;

  const answeredCount = Array.from(currentAttempt.answers.values()).filter(
    (a) => a.user_answer !== null
  ).length;
  const totalQuestions = currentAttempt.questions.length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleSubmit = () => {
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true);
    } else {
      confirmSubmit();
    }
  };

  const confirmSubmit = () => {
    let score = 0;
    currentAttempt.answers.forEach((answer, questionId) => {
      const question = currentAttempt.questions.find((q) => q.id === questionId);
      if (question && answer.user_answer === question.correct_answer) {
        score++;
      }
    });

    onComplete(score, totalQuestions);
  };

  const maxTime = currentAttempt.quiz_mode === 'exam' ? totalQuestions * 90 : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentAttempt.course_code} - Segment {currentAttempt.segment_number}
            </h1>
            <p className="text-gray-600 capitalize">
              {currentAttempt.quiz_mode} Mode
            </p>
          </div>
          <QuizTimer
            maxTime={maxTime}
            onTimeUp={confirmSubmit}
          />
        </div>

        <QuizProgress />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <QuestionCard />

            <div className="bg-white rounded-lg shadow-lg p-6">
              <Button
                onClick={handleSubmit}
                variant="primary"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Quiz
              </Button>
              {unansweredCount > 0 && (
                <p className="text-sm text-orange-600 mt-2 text-center">
                  You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <QuizNavigation />
          </div>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Submit Quiz?</h3>
                <p className="text-gray-600 mb-4">
                  You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
                  Are you sure you want to submit?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSubmitConfirm(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmSubmit}
                    variant="primary"
                    className="flex-1"
                  >
                    Submit Anyway
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
