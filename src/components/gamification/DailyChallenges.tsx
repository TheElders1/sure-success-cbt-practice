import { useState, useEffect } from 'react';
import { Calendar, Target, Award, Clock, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface DailyChallenge {
  id: string;
  challenge_date: string;
  challenge_type: string;
  description: string;
  requirement: any;
  xp_reward: number;
  bonus_multiplier: number;
  completed: boolean;
  progress: number;
}

export default function DailyChallenges() {
  const { user } = useAuthStore();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  async function loadChallenges() {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      let { data: todayChallenge } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .maybeSingle();

      if (!todayChallenge) {
        todayChallenge = await createTodayChallenge();
      }

      if (todayChallenge) {
        const { data: userProgress } = await supabase
          .from('user_daily_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_id', todayChallenge.id)
          .maybeSingle();

        setChallenges([{
          ...todayChallenge,
          completed: userProgress?.completed || false,
          progress: userProgress?.progress || 0,
        }]);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createTodayChallenge() {
    const today = new Date().toISOString().split('T')[0];
    const challengeTypes = [
      {
        type: 'complete_quizzes',
        description: 'Complete 3 quizzes today',
        requirement: { count: 3 },
        xp_reward: 150,
        bonus_multiplier: 1.5,
      },
      {
        type: 'perfect_score',
        description: 'Score 100% on any quiz',
        requirement: { score: 100 },
        xp_reward: 200,
        bonus_multiplier: 2.0,
      },
      {
        type: 'speed_challenge',
        description: 'Complete a quiz in under 10 minutes',
        requirement: { time_limit: 600 },
        xp_reward: 175,
        bonus_multiplier: 1.75,
      },
      {
        type: 'answer_streak',
        description: 'Answer 10 questions correctly in a row',
        requirement: { correct_streak: 10 },
        xp_reward: 180,
        bonus_multiplier: 1.8,
      },
    ];

    const randomChallenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    const { data, error } = await supabase
      .from('daily_challenges')
      .insert({
        challenge_date: today,
        ...randomChallenge,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }

    return data;
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

  if (challenges.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8">
          <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Challenges Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back tomorrow for new daily challenges!
          </p>
        </div>
      </Card>
    );
  }

  const challenge = challenges[0];
  const progressPercentage = challenge.requirement.count
    ? (challenge.progress / challenge.requirement.count) * 100
    : challenge.completed ? 100 : 0;

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full">
          <Target className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Daily Challenge
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bonus XP: {Math.round(challenge.bonus_multiplier * 100)}% multiplier
          </p>
        </div>
      </div>

      <div className={`p-6 rounded-xl border-2 transition-all ${
        challenge.completed
          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
          : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800'
      }`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {challenge.description}
            </h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Award size={16} />
                <span>+{challenge.xp_reward} XP</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock size={16} />
                <span>Today only</span>
              </div>
            </div>
          </div>
          {challenge.completed && (
            <div className="flex-shrink-0">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
          )}
        </div>

        {!challenge.completed && challenge.requirement.count && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {challenge.progress} / {challenge.requirement.count}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {challenge.completed && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-center font-semibold text-green-600 dark:text-green-400">
              Challenge Completed! 🎉
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              You earned {challenge.xp_reward} XP + {Math.round(challenge.xp_reward * (challenge.bonus_multiplier - 1))} bonus XP!
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Pro Tip:</strong> Complete daily challenges consistently to maximize your XP gains
          and unlock exclusive achievements!
        </p>
      </div>
    </Card>
  );
}
