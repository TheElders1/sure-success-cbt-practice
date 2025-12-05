import { Flame, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { calculateStreakMultiplier } from '@/services/achievementService';
import { useState, useEffect } from 'react';

interface StreakMultiplierProps {
  streak: number;
}

export default function StreakMultiplier({ streak }: StreakMultiplierProps) {
  const [multiplier, setMultiplier] = useState(1.0);

  useEffect(() => {
    async function loadMultiplier() {
      const mult = await calculateStreakMultiplier(streak);
      setMultiplier(mult);
    }
    loadMultiplier();
  }, [streak]);

  function getStreakColor() {
    if (streak >= 30) return 'from-red-500 to-orange-500';
    if (streak >= 14) return 'from-orange-500 to-yellow-500';
    if (streak >= 7) return 'from-yellow-500 to-green-500';
    if (streak >= 3) return 'from-green-500 to-blue-500';
    return 'from-gray-400 to-gray-500';
  }

  function getNextMilestone() {
    if (streak < 3) return { target: 3, multiplier: 1.5 };
    if (streak < 7) return { target: 7, multiplier: 2.0 };
    if (streak < 14) return { target: 14, multiplier: 2.5 };
    if (streak < 30) return { target: 30, multiplier: 3.0 };
    return null;
  }

  const nextMilestone = getNextMilestone();

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 bg-gradient-to-br ${getStreakColor()} rounded-full`}>
          <Flame className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Streak Bonus
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Keep your streak alive for bonus XP!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`p-6 rounded-xl bg-gradient-to-br ${getStreakColor()} text-white text-center`}>
          <div className="text-5xl font-bold mb-2">{streak}</div>
          <div className="text-sm uppercase tracking-wide">Day Streak</div>
          <div className="mt-4 text-2xl font-bold">
            {multiplier}x XP Multiplier
          </div>
        </div>

        {nextMilestone && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                Next Milestone
              </h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              {nextMilestone.target - streak} more days to unlock {nextMilestone.multiplier}x multiplier!
            </p>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                style={{ width: `${(streak / nextMilestone.target) * 100}%` }}
              />
            </div>
          </div>
        )}

        {!nextMilestone && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg text-center">
            <Trophy className="mx-auto mb-2 text-yellow-600 dark:text-yellow-400" size={32} />
            <p className="font-bold text-yellow-900 dark:text-yellow-300">
              Maximum Multiplier Reached!
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              You're at the highest streak bonus level!
            </p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold text-gray-900 dark:text-white">1.5x</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">3 days</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold text-gray-900 dark:text-white">2.0x</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">7 days</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold text-gray-900 dark:text-white">2.5x</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">14 days</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold text-gray-900 dark:text-white">3.0x</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">30 days</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Trophy({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
