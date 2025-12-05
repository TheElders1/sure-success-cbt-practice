import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  department: string;
  totalXP: number;
  averageScore: number;
  quizzesTaken: number;
  isCurrentUser: boolean;
}

export default function GlobalLeaderboard() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'department'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [user, filter]);

  async function loadLeaderboard() {
    if (!user) return;

    try {
      let query = supabase
        .from('users')
        .select('id, name, department, total_xp, average_score, total_quizzes_taken')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (filter === 'department' && user.department) {
        query = query.eq('department', user.department);
      }

      const { data } = await query;

      const leaderboard = data?.map((u, index) => ({
        rank: index + 1,
        userId: u.id,
        name: u.name || 'Anonymous',
        department: u.department || 'N/A',
        totalXP: u.total_xp || 0,
        averageScore: Math.round(u.average_score || 0),
        quizzesTaken: u.total_quizzes_taken || 0,
        isCurrentUser: u.id === user.id,
      })) || [];

      setEntries(leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(rank: number) {
    if (rank === 1) {
      return <Trophy className="text-yellow-500" size={28} />;
    } else if (rank === 2) {
      return <Medal className="text-gray-400" size={28} />;
    } else if (rank === 3) {
      return <Award className="text-orange-400" size={28} />;
    }
    return null;
  }

  function getRankBadge(rank: number) {
    const classes = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white";
    if (rank === 1) return `${classes} bg-gradient-to-br from-yellow-400 to-yellow-600`;
    if (rank === 2) return `${classes} bg-gradient-to-br from-gray-300 to-gray-500`;
    if (rank === 3) return `${classes} bg-gradient-to-br from-orange-400 to-orange-600`;
    return `${classes} bg-gradient-to-br from-blue-400 to-blue-600`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leaderboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Compete with peers and climb the rankings
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setFilter('department')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'department'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Department
          </button>
        </div>
      </div>

      {currentUserEntry && (
        <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-brand-primary/10 to-blue-500/10 border-2 border-brand-primary">
          <div className="flex items-center gap-4">
            <div className={getRankBadge(currentUserEntry.rank)}>
              {currentUserEntry.rank <= 3 ? getRankIcon(currentUserEntry.rank) : currentUserEntry.rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Your Ranking
                </h3>
                <span className="px-2 py-1 text-xs bg-brand-primary text-white rounded-full">
                  You
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentUserEntry.department}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentUserEntry.totalXP.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">XP</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentUserEntry.averageScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
            </div>
          </div>
        </Card>
      )}

      <Card variant="elevated" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total XP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quizzes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {entries.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`transition-colors ${
                    entry.isCurrentUser
                      ? 'bg-brand-primary/5'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 ? (
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(entry.rank)}
                        </div>
                      ) : (
                        <div className="w-8 text-center font-bold text-gray-600 dark:text-gray-400">
                          {entry.rank}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        entry.isCurrentUser
                          ? 'text-brand-primary'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {entry.name}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="px-2 py-0.5 text-xs bg-brand-primary text-white rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {entry.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp size={14} className="text-brand-primary" />
                      <span className="font-bold text-gray-900 dark:text-white">
                        {entry.totalXP.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`font-bold ${
                      entry.averageScore >= 70
                        ? 'text-green-600 dark:text-green-400'
                        : entry.averageScore >= 50
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {entry.averageScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400">
                    {entry.quizzesTaken}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
