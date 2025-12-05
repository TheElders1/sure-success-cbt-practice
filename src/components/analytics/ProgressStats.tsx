import { Target, TrendingUp, Award, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';

interface ProgressStatsProps {
  averageScore: number;
  improvementRate: number;
  totalQuizzes: number;
  currentStreak: number;
}

export default function ProgressStats({
  averageScore,
  improvementRate,
  totalQuizzes,
  currentStreak,
}: ProgressStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-lg">
            <Target className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {averageScore.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
            {improvementRate > 0 && (
              <div className="text-xs text-green-600 dark:text-green-400">
                +{improvementRate.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-4">
          <div className="bg-green-500/10 p-3 rounded-lg">
            <Award className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalQuizzes}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Quizzes</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Completed</div>
          </div>
        </div>
      </Card>

      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-lg">
            <Zap className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Days</div>
          </div>
        </div>
      </Card>

      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-lg">
            <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {improvementRate > 0 ? '+' : ''}{improvementRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Improvement</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Last 7 days</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
