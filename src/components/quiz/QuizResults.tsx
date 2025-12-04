import { CheckCircle, XCircle, Trophy, Clock, Target, TrendingUp } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  onReview: () => void;
  onRetake: () => void;
  onExit: () => void;
}

export default function QuizResults({
  score,
  totalQuestions,
  timeSpent,
  onReview,
  onRetake,
  onExit,
}: QuizResultsProps) {
  const { currentAttempt } = useQuizStore();

  const percentage = Math.round((score / totalQuestions) * 100);
  const isPerfect = score === totalQuestions;
  const isPassed = percentage >= 70;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const { grade, color } = getGrade(percentage);

  const wrongAnswers = totalQuestions - score;
  const averageTimePerQuestion = Math.round(timeSpent / totalQuestions);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            {isPerfect ? (
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            ) : isPassed ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="text-4xl font-bold mb-2">
              {isPerfect
                ? 'Perfect Score!'
                : isPassed
                ? 'Well Done!'
                : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-600 text-lg">
              {currentAttempt?.course_code} - Segment {currentAttempt?.segment_number}
            </p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={isPassed ? '#10b981' : '#ef4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(percentage / 100) * 553} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${color}`}>{percentage}%</span>
                <span className={`text-3xl font-bold ${color}`}>{grade}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </Card>

            <Card className="text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{wrongAnswers}</div>
              <div className="text-sm text-gray-600">Wrong</div>
            </Card>

            <Card className="text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </Card>

            <Card className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{averageTimePerQuestion}s</div>
              <div className="text-sm text-gray-600">Avg per Q</div>
            </Card>
          </div>

          {isPerfect && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-center font-semibold">
                Congratulations! You achieved a perfect score!
              </p>
            </div>
          )}

          {!isPassed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <strong>Tip:</strong> Review the questions you got wrong and try again.
                Practice makes perfect!
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onReview}
              variant="primary"
              className="flex-1"
            >
              Review Answers
            </Button>
            <Button
              onClick={onRetake}
              variant="secondary"
              className="flex-1"
            >
              Retake Quiz
            </Button>
            <Button
              onClick={onExit}
              variant="secondary"
              className="flex-1"
            >
              Exit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
