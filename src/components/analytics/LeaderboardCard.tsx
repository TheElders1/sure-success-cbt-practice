import { Trophy, TrendingUp, Award } from 'lucide-react';
import Card from '@/components/ui/Card';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  totalXP: number;
  isCurrentUser?: boolean;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  title?: string;
  subtitle?: string;
}

export default function LeaderboardCard({ entries, title = 'Leaderboard', subtitle }: LeaderboardCardProps) {
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={20} />;
    if (rank === 2) return <Award className="text-gray-400" size={20} />;
    if (rank === 3) return <Award className="text-orange-400" size={20} />;
    return null;
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <TrendingUp className="text-brand-primary" size={24} />
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              entry.isCurrentUser
                ? 'bg-brand-primary/10 border-2 border-brand-primary'
                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8">
              {getMedalIcon(entry.rank) || (
                <span className="font-bold text-gray-600 dark:text-gray-400">
                  {entry.rank}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${
                entry.isCurrentUser
                  ? 'text-brand-primary'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {entry.name}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs text-brand-primary">(You)</span>
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {entry.totalXP.toLocaleString()} XP
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {entry.score}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
