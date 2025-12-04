import { useState } from 'react';
import { CheckCircle, XCircle, ArrowLeft, Filter } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';
import AnswerOptions from './AnswerOptions';
import Button from '../ui/Button';

interface QuizReviewProps {
  onExit: () => void;
}

export default function QuizReview({ onExit }: QuizReviewProps) {
  const { currentAttempt } = useQuizStore();
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  if (!currentAttempt) return null;

  const questionsWithAnswers = currentAttempt.questions.map((question) => {
    const answer = currentAttempt.answers.get(question.id);
    const isCorrect = answer?.user_answer === question.correct_answer;
    return { question, answer, isCorrect };
  });

  const filteredQuestions = questionsWithAnswers.filter(({ isCorrect }) => {
    if (filter === 'correct') return isCorrect;
    if (filter === 'wrong') return !isCorrect;
    return true;
  });

  const correctCount = questionsWithAnswers.filter((q) => q.isCorrect).length;
  const wrongCount = questionsWithAnswers.length - correctCount;

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button onClick={onExit} variant="secondary" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Review Your Answers</h1>

            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-semibold">
                    {correctCount} Correct
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-semibold">
                    {wrongCount} Wrong
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Questions</option>
                  <option value="correct">Correct Only</option>
                  <option value="wrong">Wrong Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map(({ question, answer, isCorrect }, index) => {
            const isExpanded = expandedQuestions.has(question.id);

            return (
              <div
                key={question.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
              >
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-500">
                          Question {index + 1}
                        </span>
                        {question.difficulty && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
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
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {question.question_text}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      {isExpanded ? '−' : '+'}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4">
                    <AnswerOptions
                      questionId={question.id}
                      options={question.options}
                      showCorrectAnswer={true}
                      correctAnswer={question.correct_answer}
                    />

                    {!isCorrect && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                          <strong>Your answer:</strong> {answer?.user_answer || 'Not answered'}
                        </p>
                        <p className="text-sm text-red-800 mt-1">
                          <strong>Correct answer:</strong> {question.correct_answer}
                        </p>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                        <p className="text-blue-800">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500">No questions match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
