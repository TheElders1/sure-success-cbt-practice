import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';
import AnswerOptions from './AnswerOptions';
import Button from '../ui/Button';

interface QuestionCardProps {
  showExplanation?: boolean;
}

export default function QuestionCard({ showExplanation = false }: QuestionCardProps) {
  const {
    currentAttempt,
    currentQuestionIndex,
    toggleMarkQuestion,
    nextQuestion,
    previousQuestion,
  } = useQuizStore();

  if (!currentAttempt) return null;

  const question = currentAttempt.questions[currentQuestionIndex];
  const answer = currentAttempt.answers.get(question.id);
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === currentAttempt.questions.length - 1;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {question.course_code}
            </span>
            {question.difficulty && (
              <span
                className={`px-2 py-1 rounded ${
                  question.difficulty === 'easy'
                    ? 'bg-green-100 text-green-700'
                    : question.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {question.difficulty}
              </span>
            )}
            {question.topic && (
              <span className="text-gray-500">{question.topic}</span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {question.question_text}
          </h3>
        </div>
        <button
          onClick={() => toggleMarkQuestion(question.id)}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            answer?.is_marked
              ? 'bg-orange-100 text-orange-600'
              : 'bg-gray-100 text-gray-400 hover:text-orange-600'
          }`}
          title={answer?.is_marked ? 'Unmark for review' : 'Mark for review'}
        >
          <Flag className={answer?.is_marked ? 'fill-current' : ''} />
        </button>
      </div>

      <AnswerOptions
        questionId={question.id}
        options={question.options}
        showCorrectAnswer={showExplanation}
        correctAnswer={question.correct_answer}
      />

      {showExplanation && question.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          onClick={previousQuestion}
          disabled={isFirstQuestion}
          variant="secondary"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {currentAttempt.questions.length}
        </div>

        <Button
          onClick={nextQuestion}
          disabled={isLastQuestion}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
