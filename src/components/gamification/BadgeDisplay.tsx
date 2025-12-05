import { useState, useEffect } from 'react';
import { Trophy, Award, Star, Shield, Flame, Crown, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
  is_displayed?: boolean;
}

const getBadgeIcon = (iconName: string, unlocked: boolean) => {
  const iconProps = {
    size: 32,
    className: unlocked ? 'text-current' : 'text-gray-400',
  };

  const icons: Record<string, JSX.Element> = {
    trophy: <Trophy {...iconProps} />,
    award: <Award {...iconProps} />,
    star: <Star {...iconProps} />,
    shield: <Shield {...iconProps} />,
    flame: <Flame {...iconProps} />,
    crown: <Crown {...iconProps} />,
    'book-open': <BookOpen {...iconProps} />,
    seedling: <Award {...iconProps} />,
  };

  return icons[iconName] || <Award {...iconProps} />;
};

export default function BadgeDisplay() {
  const { user } = useAuthStore();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBadges();
    }
  }, [user]);

  async function loadBadges() {
    if (!user) return;

    try {
      const [allBadgesRes, userBadgesRes] = await Promise.all([
        supabase.from('badges').select('*'),
        supabase
          .from('user_badges')
          .select(`
            *,
            badge:badges(*)
          `)
          .eq('user_id', user.id),
      ]);

      const earned = userBadgesRes.data?.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        color: ub.badge.color,
        rarity: ub.badge.rarity,
        earned_at: ub.earned_at,
        is_displayed: ub.is_displayed,
      })) || [];

      setEarnedBadges(earned);
      setAllBadges(allBadgesRes.data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBadgeDisplay(badgeId: string) {
    if (!user) return;

    const badge = earnedBadges.find((b) => b.id === badgeId);
    if (!badge) return;

    try {
      await supabase
        .from('user_badges')
        .update({ is_displayed: !badge.is_displayed })
        .eq('user_id', user.id)
        .eq('badge_id', badgeId);

      setEarnedBadges(earnedBadges.map((b) =>
        b.id === badgeId ? { ...b, is_displayed: !b.is_displayed } : b
      ));
    } catch (error) {
      console.error('Error toggling badge display:', error);
    }
  }

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  const earnedIds = new Set(earnedBadges.map(b => b.id));
  const lockedBadges = allBadges.filter(b => !earnedIds.has(b.id));

  function getRarityBorder(rarity: string) {
    const borders = {
      common: 'border-gray-300 dark:border-gray-600',
      rare: 'border-blue-400 dark:border-blue-500',
      epic: 'border-purple-400 dark:border-purple-500',
      legendary: 'border-yellow-400 dark:border-yellow-500',
    };
    return borders[rarity as keyof typeof borders] || borders.common;
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Badges</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {earnedBadges.length} of {allBadges.length} unlocked
          </p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
          <span className="text-yellow-800 dark:text-yellow-200 font-semibold">
            {allBadges.length > 0 ? Math.round((earnedBadges.length / allBadges.length) * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {earnedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Unlocked
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {earnedBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => toggleBadgeDisplay(badge.id)}
                  className={`rounded-lg p-4 border-2 hover:scale-105 transition-transform ${
                    badge.is_displayed
                      ? `${getRarityBorder(badge.rarity)} shadow-lg`
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={badge.is_displayed ? { backgroundColor: badge.color + '20' } : undefined}
                >
                  <div className="flex justify-center mb-2" style={{ color: badge.color }}>
                    {getBadgeIcon(badge.icon, true)}
                  </div>
                  <p className="text-xs font-semibold text-center text-gray-900 dark:text-white mb-1">
                    {badge.name}
                  </p>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                    {badge.description}
                  </p>
                  {badge.earned_at && (
                    <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                  {badge.is_displayed && (
                    <div className="mt-2 flex justify-center">
                      <Star size={14} className="text-yellow-500 fill-current" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Locked
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 opacity-60"
                >
                  <div className="flex justify-center mb-2">
                    {getBadgeIcon(badge.icon, false)}
                  </div>
                  <p className="text-xs font-semibold text-center text-gray-700 dark:text-gray-300 mb-1">
                    {badge.name}
                  </p>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
