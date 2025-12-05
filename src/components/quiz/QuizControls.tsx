import { Pause, Play, Bookmark, AlertTriangle, Filter, X } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function QuizControls() {
  const { isPaused, pauseQuiz, resumeQuiz, showOnlyMarked, showOnlyIncorrect, toggleShowOnlyMarked, toggleShowOnlyIncorrect, currentAttempt } = useQuizStore();

  if (!currentAttempt) return null;

  const canPause = currentAttempt.quiz_mode === 'practice';
  const markedCount = Array.from(currentAttempt.answers.values()).filter(a => a.is_marked).length;
  const incorrectCount = Array.from(currentAttempt.answers.values()).filter(a => {
    const question = currentAttempt.questions.find(q => q.id === a.question_id);
    return question && a.user_answer && a.user_answer !== question.correct_answer;
  }).length;

  return (
    <Card variant="default" padding="sm">
      <div className="flex flex-wrap gap-2">
        {canPause && (
          <Button
            variant="secondary"
            size="sm"
            onClick={isPaused ? resumeQuiz : pauseQuiz}
            className="gap-2"
          >
            {isPaused ? (
              <>
                <Play size={16} />
                Resume
              </>
            ) : (
              <>
                <Pause size={16} />
                Pause
              </>
            )}
          </Button>
        )}

        <Button
          variant={showOnlyMarked ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleShowOnlyMarked}
          className="gap-2"
          disabled={markedCount === 0}
        >
          {showOnlyMarked ? <X size={16} /> : <Bookmark size={16} />}
          Marked ({markedCount})
        </Button>

        <Button
          variant={showOnlyIncorrect ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleShowOnlyIncorrect}
          className="gap-2"
          disabled={incorrectCount === 0}
        >
          {showOnlyIncorrect ? <X size={16} /> : <AlertTriangle size={16} />}
          Review Wrong ({incorrectCount})
        </Button>
      </div>

      {(showOnlyMarked || showOnlyIncorrect) && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2 text-sm">
          <Filter size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-blue-800 dark:text-blue-200">
            {showOnlyMarked && `Showing only marked questions (${markedCount} total)`}
            {showOnlyIncorrect && `Showing only incorrect answers (${incorrectCount} total)`}
          </span>
        </div>
      )}
    </Card>
  );
}
