import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface FriendStats {
  id: string;
  name: string;
  avatar_url?: string;
  total_xp: number;
  level: number;
  study_streak: number;
  average_score: number;
  total_quizzes_taken: number;
}

export default function FriendComparison() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<FriendStats[]>([]);
  const [myStats, setMyStats] = useState<FriendStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadComparison();
    }
  }, [user]);

  async function loadComparison() {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: myProfile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (userData) {
        setMyStats({
          id: userData.id,
          name: userData.name,
          avatar_url: myProfile?.avatar_url,
          total_xp: userData.total_xp || 0,
          level: userData.level || 1,
          study_streak: userData.study_streak || 0,
          average_score: Number(userData.average_score) || 0,
          total_quizzes_taken: userData.total_quizzes_taken || 0,
        });
      }

      const { data: friendshipsData } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const friendIds = friendshipsData?.map(f =>
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const { data: friendsData } = await supabase
        .from('users')
        .select('*')
        .in('id', friendIds);

      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, avatar_url')
        .in('id', friendIds);

      const friendsWithStats: FriendStats[] = (friendsData || []).map(friend => {
        const profile = profilesData?.find(p => p.id === friend.id);
        return {
          id: friend.id,
          name: friend.name,
          avatar_url: profile?.avatar_url,
          total_xp: friend.total_xp || 0,
          level: friend.level || 1,
          study_streak: friend.study_streak || 0,
          average_score: Number(friend.average_score) || 0,
          total_quizzes_taken: friend.total_quizzes_taken || 0,
        };
      });

      setFriends(friendsWithStats.sort((a, b) => b.total_xp - a.total_xp));
    } catch (error) {
      console.error('Error loading friend comparison:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  if (friends.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Add friends to compare your progress!
        </div>
      </Card>
    );
  }

  const getComparison = (myStat: number, friendStat: number) => {
    if (myStat > friendStat) return { icon: TrendingUp, color: 'text-green-600 dark:text-green-400', text: 'ahead' };
    if (myStat < friendStat) return { icon: TrendingUp, color: 'text-red-600 dark:text-red-400', text: 'behind' };
    return { icon: Target, color: 'text-gray-600 dark:text-gray-400', text: 'tied' };
  };

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Friend Comparison
      </h3>

      {myStats && (
        <div className="mb-6 p-4 bg-brand-primary/10 rounded-lg border-2 border-brand-primary">
          <div className="flex items-center gap-3 mb-3">
            {myStats.avatar_url ? (
              <img
                src={myStats.avatar_url}
                alt={myStats.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center">
                <Trophy size={24} className="text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{myStats.name} (You)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Level {myStats.level} • {myStats.total_xp.toLocaleString()} XP
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {myStats.average_score.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {myStats.study_streak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {myStats.total_quizzes_taken}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Quizzes</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {friends.map((friend) => {
          const xpComparison = getComparison(myStats?.total_xp || 0, friend.total_xp);
          const scoreComparison = getComparison(myStats?.average_score || 0, friend.average_score);

          return (
            <div
              key={friend.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                {friend.avatar_url ? (
                  <img
                    src={friend.avatar_url}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <Trophy size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {friend.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Level {friend.level} • {friend.total_xp.toLocaleString()} XP
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                  <span className="text-gray-600 dark:text-gray-400">XP</span>
                  <div className="flex items-center gap-1">
                    <xpComparison.icon size={14} className={xpComparison.color} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.abs((myStats?.total_xp || 0) - friend.total_xp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Score</span>
                  <div className="flex items-center gap-1">
                    <scoreComparison.icon size={14} className={scoreComparison.color} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.abs((myStats?.average_score || 0) - friend.average_score).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
