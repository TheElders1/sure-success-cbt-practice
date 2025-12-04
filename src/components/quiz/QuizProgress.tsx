import { useQuizStore } from '../../store/useQuizStore';

export default function QuizProgress() {
  const { currentAttempt, currentQuestionIndex } = useQuizStore();

  if (!currentAttempt) return null;

  const totalQuestions = currentAttempt.questions.length;
  const answeredCount = Array.from(currentAttempt.answers.values()).filter(
    (a) => a.user_answer !== null
  ).length;
  const markedCount = Array.from(currentAttempt.answers.values()).filter(
    (a) => a.is_marked
  ).length;

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const answeredPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <div className="flex gap-4">
          <span className="text-green-600">
            Answered: {answeredCount}/{totalQuestions}
          </span>
          {markedCount > 0 && (
            <span className="text-orange-600">
              Marked: {markedCount}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${answeredPercentage}%` }}
          />
        </div>
        <div
          className="absolute top-0 h-2 w-1 bg-blue-600 transition-all duration-300"
          style={{ left: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
