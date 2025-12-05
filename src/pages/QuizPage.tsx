import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QuizInterface from '@/components/quiz/QuizInterface';
import QuizResults from '@/components/quiz/QuizResults';
import QuizReview from '@/components/quiz/QuizReview';
import { useQuizStore } from '@/store/useQuizStore';
import { useAuthStore } from '@/store/useAuthStore';
import { loadQuizQuestions, createQuizAttempt, completeQuizAttempt } from '@/services/quizService';
import { BookOpen, PlayCircle, Loader, Zap, Clock, Target } from 'lucide-react';

type QuizState = 'select' | 'loading' | 'quiz' | 'results' | 'review';

export default function QuizPage() {
  const { courseCode } = useParams<{ courseCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startQuiz, currentAttempt, resetQuiz, timeElapsed } = useQuizStore();

  const [state, setState] = useState<QuizState>('select');
  const [selectedSegment, setSelectedSegment] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<'practice' | 'exam' | 'quick'>('practice');
  const [error, setError] = useState<string>('');
  const [attemptId, setAttemptId] = useState<string>('');
  const [quizResult, setQuizResult] = useState<{
    score: number;
    totalQuestions: number;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleStartQuiz = async () => {
    if (!user || !courseCode) return;

    setState('loading');
    setError('');

    try {
      const questions = await loadQuizQuestions(courseCode, selectedSegment);

      if (questions.length === 0) {
        setError('No questions available for this segment yet. Please check back later.');
        setState('select');
        return;
      }

      const newAttemptId = await createQuizAttempt(
        user.id,
        courseCode,
        selectedSegment,
        questions.length,
        selectedMode
      );

      setAttemptId(newAttemptId);
      startQuiz(courseCode, selectedSegment, questions, selectedMode);
      setState('quiz');
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load quiz. Please try again.'
      );
      setState('select');
    }
  };

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (!currentAttempt || !user) return;

    try {
      await completeQuizAttempt(attemptId, currentAttempt, score, timeElapsed);
      setQuizResult({ score, totalQuestions });
      setState('results');
    } catch (err) {
      console.error('Failed to save quiz results:', err);
      setError('Failed to save results. Please try again.');
    }
  };

  const handleReview = () => {
    setState('review');
  };

  const handleRetake = () => {
    resetQuiz();
    setState('select');
  };

  const handleExit = () => {
    resetQuiz();
    navigate('/dashboard');
  };

  if (state === 'quiz' && currentAttempt) {
    return <QuizInterface onComplete={handleQuizComplete} />;
  }

  if (state === 'results' && quizResult) {
    return (
      <QuizResults
        score={quizResult.score}
        totalQuestions={quizResult.totalQuestions}
        timeSpent={timeElapsed}
        onReview={handleReview}
        onRetake={handleRetake}
        onExit={handleExit}
      />
    );
  }

  if (state === 'review') {
    return <QuizReview onExit={() => setState('results')} />;
  }

  return (
    <Layout
      headerTitle={`Quiz - ${courseCode}`}
      headerSubtitle="Practice makes perfect"
    >
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <Card variant="elevated" padding="lg">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full">
                  <BookOpen className="text-blue-600 dark:text-blue-400" size={48} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {courseCode} Quiz
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Select a segment and mode to start practicing
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz Segment
                </label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={state === 'loading'}
                >
                  {[1, 2, 3, 4, 5].map((segment) => (
                    <option key={segment} value={segment}>
                      Segment {segment}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedMode('practice')}
                    disabled={state === 'loading'}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMode === 'practice'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <Target className={`w-8 h-8 mx-auto mb-2 ${
                      selectedMode === 'practice' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <div className="font-semibold text-gray-900 dark:text-white">Practice</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Untimed, with hints
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMode('exam')}
                    disabled={state === 'loading'}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMode === 'exam'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <Clock className={`w-8 h-8 mx-auto mb-2 ${
                      selectedMode === 'exam' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <div className="font-semibold text-gray-900 dark:text-white">Exam</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Timed, 1.5x XP
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMode('quick')}
                    disabled={state === 'loading'}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMode === 'quick'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <Zap className={`w-8 h-8 mx-auto mb-2 ${
                      selectedMode === 'quick' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <div className="font-semibold text-gray-900 dark:text-white">Quick Quiz</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      10 random questions
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStartQuiz}
                disabled={state === 'loading'}
                variant="primary"
                className="w-full"
              >
                {state === 'loading' ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Loading Questions...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>

              <button
                onClick={() => navigate('/home')}
                className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Choose Another Course
              </button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
