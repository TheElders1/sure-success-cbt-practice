import { Flag } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';

export default function QuizNavigation() {
  const { currentAttempt, currentQuestionIndex, setCurrentQuestion } = useQuizStore();

  if (!currentAttempt) return null;

  const getQuestionStatus = (questionId: string, index: number) => {
    const answer = currentAttempt.answers.get(questionId);
    const isCurrent = index === currentQuestionIndex;
    const isAnswered = answer?.user_answer !== null;
    const isMarked = answer?.is_marked;

    if (isCurrent) {
      return 'bg-blue-600 text-white border-blue-600';
    }
    if (isAnswered && isMarked) {
      return 'bg-orange-100 text-orange-700 border-orange-300';
    }
    if (isAnswered) {
      return 'bg-green-100 text-green-700 border-green-300';
    }
    if (isMarked) {
      return 'bg-orange-50 text-orange-600 border-orange-200';
    }
    return 'bg-white text-gray-700 border-gray-300 hover:border-blue-400';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {currentAttempt.questions.map((question, index) => {
          const answer = currentAttempt.answers.get(question.id);
          return (
            <button
              key={question.id}
              onClick={() => setCurrentQuestion(index)}
              className={`relative aspect-square rounded-lg border-2 transition-all font-semibold ${getQuestionStatus(
                question.id,
                index
              )}`}
            >
              {index + 1}
              {answer?.is_marked && (
                <Flag className="w-3 h-3 absolute -top-1 -right-1 fill-orange-500 text-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded border-2 border-blue-600" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded border-2 border-green-300" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-100 rounded border-2 border-orange-300" />
          <span>Answered & Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded border-2 border-gray-300" />
          <span>Not Answered</span>
        </div>
      </div>
    </div>
  );
}
