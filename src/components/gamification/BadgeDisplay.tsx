import { Trophy, Award, Star, Zap, Target, Flame, Crown } from 'lucide-react';
import Card from '@/components/ui/Card';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  requirement?: number;
}

interface BadgeDisplayProps {
  badges: Badge[];
}

const getBadgeIcon = (iconName: string, unlocked: boolean) => {
  const iconProps = {
    size: 32,
    className: unlocked ? 'text-yellow-500' : 'text-gray-400',
  };

  const icons: Record<string, JSX.Element> = {
    trophy: <Trophy {...iconProps} />,
    award: <Award {...iconProps} />,
    star: <Star {...iconProps} />,
    zap: <Zap {...iconProps} />,
    target: <Target {...iconProps} />,
    flame: <Flame {...iconProps} />,
    crown: <Crown {...iconProps} />,
  };

  return icons[iconName] || <Award {...iconProps} />;
};

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {unlockedBadges.length} of {badges.length} unlocked
          </p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
          <span className="text-yellow-800 dark:text-yellow-200 font-semibold">
            {Math.round((unlockedBadges.length / badges.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {unlockedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Unlocked
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="flex justify-center mb-2">
                    {getBadgeIcon(badge.icon, true)}
                  </div>
                  <p className="text-xs font-semibold text-center text-gray-900 dark:text-white mb-1">
                    {badge.name}
                  </p>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
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
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
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
                  {badge.progress !== undefined && badge.requirement !== undefined && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-1">
                        {badge.progress} / {badge.requirement}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
