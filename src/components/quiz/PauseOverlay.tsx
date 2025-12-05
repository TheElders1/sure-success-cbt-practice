import { Play, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/store/useQuizStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PauseOverlay() {
  const { isPaused, resumeQuiz, resetQuiz } = useQuizStore();
  const navigate = useNavigate();

  if (!isPaused) return null;

  const handleExit = () => {
    resetQuiz();
    navigate('/home');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-full">
              <Play className="text-orange-600 dark:text-orange-400" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Paused
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your progress has been saved. Take a break and resume when ready!
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={resumeQuiz}
            className="gap-2"
          >
            <Play size={20} />
            Resume Quiz
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleExit}
            className="gap-2"
          >
            <Home size={20} />
            Exit to Home
          </Button>
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Your answers and time will be preserved
        </p>
      </Card>
    </div>
  );
}
