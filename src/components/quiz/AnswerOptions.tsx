import { useQuizStore } from '../../store/useQuizStore';

interface AnswerOptionsProps {
  questionId: string;
  options: string[];
  showCorrectAnswer?: boolean;
  correctAnswer?: string;
}

export default function AnswerOptions({
  questionId,
  options,
  showCorrectAnswer = false,
  correctAnswer,
}: AnswerOptionsProps) {
  const { currentAttempt, answerQuestion } = useQuizStore();

  if (!currentAttempt) return null;

  const currentAnswer = currentAttempt.answers.get(questionId);
  const selectedAnswer = currentAnswer?.user_answer;

  const handleOptionClick = (option: string) => {
    if (!showCorrectAnswer) {
      answerQuestion(questionId, option);
    }
  };

  const getOptionStyle = (option: string) => {
    const isSelected = selectedAnswer === option;
    const isCorrect = showCorrectAnswer && option === correctAnswer;
    const isWrong = showCorrectAnswer && isSelected && option !== correctAnswer;

    if (isCorrect) {
      return 'bg-green-100 border-green-500 text-green-900';
    }
    if (isWrong) {
      return 'bg-red-100 border-red-500 text-red-900';
    }
    if (isSelected) {
      return 'bg-blue-100 border-blue-500 text-blue-900';
    }
    return 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50';
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleOptionClick(option)}
          disabled={showCorrectAnswer}
          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
            option
          )} ${showCorrectAnswer ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm">
              {optionLabels[index]}
            </span>
            <span className="flex-1 pt-1">{option}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
