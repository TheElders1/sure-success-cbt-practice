import { supabase } from '@/lib/supabase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  badge_id: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  quizzes_completed: number;
  consecutive_days: number;
  perfect_scores: number;
  average_score: number;
  total_xp: number;
  competitions_joined: number;
}

export async function checkAndAwardAchievements(userId: string, stats: UserStats): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  try {
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    for (const achievement of achievements || []) {
      if (earnedIds.has(achievement.id)) continue;

      let earned = false;

      switch (achievement.requirement_type) {
        case 'quizzes_completed':
          earned = stats.quizzes_completed >= achievement.requirement_value;
          break;
        case 'consecutive_days':
          earned = stats.consecutive_days >= achievement.requirement_value;
          break;
        case 'perfect_scores':
          earned = stats.perfect_scores >= achievement.requirement_value;
          break;
        case 'average_score':
          earned = stats.average_score >= achievement.requirement_value;
          break;
        case 'competitions_joined':
          earned = stats.competitions_joined >= achievement.requirement_value;
          break;
        case 'monthly_consistency':
          earned = stats.consecutive_days >= achievement.requirement_value;
          break;
        case 'legendary_achievement':
          earned = stats.quizzes_completed >= achievement.requirement_value &&
                   stats.average_score >= 80;
          break;
        case 'speed_score':
          break;
      }

      if (earned) {
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
          progress: achievement.requirement_value,
        });

        await supabase.rpc('increment_user_xp', {
          user_id: userId,
          xp_amount: achievement.xp_reward,
        });

        if (achievement.badge_id) {
          await supabase.from('user_badges').insert({
            user_id: userId,
            badge_id: achievement.badge_id,
          });
        }

        newAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }

  return newAchievements;
}

export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
): Promise<void> {
  try {
    await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        progress,
      });
  } catch (error) {
    console.error('Error updating achievement progress:', error);
  }
}

export async function getUserAchievements(userId: string) {
  try {
    const { data } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    return data || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

export async function calculateStreakMultiplier(streak: number): Promise<number> {
  if (streak >= 30) return 3.0;
  if (streak >= 14) return 2.5;
  if (streak >= 7) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

export async function calculateQuizRewards(
  score: number,
  timeTaken: number,
  streak: number
): Promise<{ xp: number; bonus: number }> {
  let baseXP = Math.round(score);

  if (score === 100) baseXP += 50;
  if (score >= 90) baseXP += 25;

  if (timeTaken < 300) {
    baseXP += 30;
  }

  const multiplier = await calculateStreakMultiplier(streak);
  const bonus = Math.round(baseXP * (multiplier - 1));
  const totalXP = baseXP + bonus;

  return { xp: totalXP, bonus };
}
