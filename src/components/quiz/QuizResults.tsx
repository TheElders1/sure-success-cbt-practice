import { CheckCircle, XCircle, Trophy, Clock, Target, TrendingUp, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600 dark:text-green-400' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600 dark:text-blue-400' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400' };
    return { grade: 'F', color: 'text-red-600 dark:text-red-400' };
  };

  const { grade, color } = getGrade(percentage);

  const wrongAnswers = totalQuestions - score;
  const averageTimePerQuestion = Math.round(timeSpent / totalQuestions);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <div className="text-center mb-8">
            {isPerfect ? (
              <Trophy className="w-16 md:w-20 h-16 md:h-20 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
            ) : isPassed ? (
              <CheckCircle className="w-16 md:w-20 h-16 md:h-20 text-green-500 dark:text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 md:w-20 h-16 md:h-20 text-red-500 dark:text-red-400 mx-auto mb-4" />
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              {isPerfect
                ? 'Perfect Score!'
                : isPassed
                ? 'Well Done!'
                : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
              {currentAttempt?.course_code} - Segment {currentAttempt?.segment_number}
            </p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                  className="md:hidden"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                  className="hidden md:block"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  stroke={isPassed ? '#10b981' : '#ef4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(percentage / 100) * 452} 452`}
                  strokeLinecap="round"
                  className="md:hidden"
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
                  className="hidden md:block"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl md:text-5xl font-bold ${color}`}>{percentage}%</span>
                <span className={`text-2xl md:text-3xl font-bold ${color}`}>{grade}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <Card className="text-center">
              <Target className="w-6 md:w-8 h-6 md:h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{score}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </Card>

            <Card className="text-center">
              <XCircle className="w-6 md:w-8 h-6 md:h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{wrongAnswers}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Wrong</div>
            </Card>

            <Card className="text-center">
              <Clock className="w-6 md:w-8 h-6 md:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{formatTime(timeSpent)}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Time</div>
            </Card>

            <Card className="text-center">
              <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{averageTimePerQuestion}s</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Avg per Q</div>
            </Card>
          </div>

          {isPerfect && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-300 text-center font-semibold">
                Congratulations! You achieved a perfect score!
              </p>
            </div>
          )}

          {!isPassed && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-300">
                <strong>Tip:</strong> Review the questions you got wrong and try again.
                Practice makes perfect!
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
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
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/home')}
                className="flex-1 px-6 py-3 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Choose Another Course
              </button>
              <Button
                onClick={onExit}
                variant="secondary"
                className="flex-1"
              >
                Exit to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
