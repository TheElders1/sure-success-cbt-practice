import { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';

interface QuizTimerProps {
  maxTime?: number;
  onTimeUp?: () => void;
}

export default function QuizTimer({ maxTime, onTimeUp }: QuizTimerProps) {
  const { timeElapsed, setTimeElapsed } = useQuizStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(timeElapsed + 1);

      if (maxTime && timeElapsed >= maxTime && onTimeUp) {
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeElapsed, maxTime, onTimeUp, setTimeElapsed]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = maxTime && timeElapsed > maxTime * 0.8;
  const isDanger = maxTime && timeElapsed > maxTime * 0.95;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${
      isDanger ? 'bg-red-100 text-red-700' :
      isWarning ? 'bg-yellow-100 text-yellow-700' :
      'bg-gray-100 text-gray-700'
    }`}>
      <Clock className="w-5 h-5" />
      <span>{formatTime(timeElapsed)}</span>
      {maxTime && (
        <span className="text-sm opacity-70">
          / {formatTime(maxTime)}
        </span>
      )}
    </div>
  );
}
