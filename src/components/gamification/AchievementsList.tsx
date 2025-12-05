import { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_value: number;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  progress: number;
  earned_at?: string;
}

export default function AchievementsList() {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  async function loadAchievements() {
    if (!user) return;

    try {
      const [achievementsRes, userAchievementsRes] = await Promise.all([
        supabase.from('achievements').select('*').order('rarity', { ascending: true }),
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id),
      ]);

      const earnedMap = new Map(
        userAchievementsRes.data?.map((ua) => [
          ua.achievement_id,
          { progress: ua.progress, earned_at: ua.earned_at },
        ])
      );

      const allAchievements = achievementsRes.data?.map((a) => ({
        ...a,
        earned: earnedMap.has(a.id),
        progress: earnedMap.get(a.id)?.progress || 0,
        earned_at: earnedMap.get(a.id)?.earned_at,
      })) || [];

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  function getIcon(iconName: string) {
    const IconComponent = (Icons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())];
    return IconComponent ? <IconComponent size={24} /> : <Trophy size={24} />;
  }

  function getRarityColor(rarity: string) {
    const colors = {
      common: 'text-gray-600 dark:text-gray-400',
      rare: 'text-blue-600 dark:text-blue-400',
      epic: 'text-purple-600 dark:text-purple-400',
      legendary: 'text-yellow-600 dark:text-yellow-400',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  function getRarityBg(rarity: string) {
    const colors = {
      common: 'bg-gray-100 dark:bg-gray-800',
      rare: 'bg-blue-100 dark:bg-blue-900/30',
      epic: 'bg-purple-100 dark:bg-purple-900/30',
      legendary: 'bg-yellow-100 dark:bg-yellow-900/30',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'earned') return a.earned;
    if (filter === 'locked') return !a.earned;
    return a.category === filter;
  });

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Achievements
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {earnedCount} of {totalCount} unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-brand-primary">
              {Math.round((earnedCount / totalCount) * 100)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Complete</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
          <div
            className="bg-gradient-to-r from-brand-primary to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'earned'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Earned
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'locked'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Locked
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            variant="elevated"
            padding="md"
            className={`${getRarityBg(achievement.rarity)} ${
              achievement.earned ? 'ring-2 ring-green-500' : 'opacity-75'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${getRarityColor(achievement.rarity)} ${
                  achievement.earned ? 'bg-white dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {achievement.earned ? (
                  getIcon(achievement.icon)
                ) : (
                  <Lock size={24} className="text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    +{achievement.xp_reward} XP
                  </span>
                  {achievement.earned && achievement.earned_at && (
                    <span className="text-gray-500 dark:text-gray-500">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
