import { useState, useEffect } from 'react';
import { Trophy, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function getRarityColor(rarity: string) {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  function getRarityGlow(rarity: string) {
    const glows = {
      common: 'shadow-gray-500/50',
      rare: 'shadow-blue-500/50',
      epic: 'shadow-purple-500/50',
      legendary: 'shadow-yellow-500/50',
    };
    return glows[rarity as keyof typeof glows] || glows.common;
  }

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <Card
            variant="elevated"
            padding="lg"
            className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-2xl ${getRarityGlow(achievement.rarity)} relative overflow-hidden`}
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>

            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mt-16 -mr-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mb-12 -ml-12" />

            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Trophy size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="animate-pulse" />
                    <h3 className="text-lg font-bold">Achievement Unlocked!</h3>
                  </div>
                  <p className="text-xl font-bold mb-1">{achievement.name}</p>
                  <p className="text-sm text-white/90">{achievement.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {achievement.rarity}
                </span>
                <span className="text-lg font-bold">
                  +{achievement.xp_reward} XP
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
