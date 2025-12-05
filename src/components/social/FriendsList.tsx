import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, UserX, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface Friend {
  id: string;
  name: string;
  avatar_url?: string;
  level: number;
  total_xp: number;
  status: 'accepted' | 'pending' | 'blocked';
  isSender: boolean;
}

export default function FriendsList() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  async function loadFriends() {
    if (!user) return;

    try {
      const { data: friendshipsData, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      const friendIds = friendshipsData?.map(f =>
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, level, total_xp')
        .in('id', friendIds);

      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, avatar_url')
        .in('id', friendIds);

      const friendsWithData: Friend[] = (friendshipsData || []).map(friendship => {
        const friendId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
        const userData = usersData?.find(u => u.id === friendId);
        const profileData = profilesData?.find(p => p.id === friendId);

        return {
          id: friendId,
          name: userData?.name || 'Unknown',
          avatar_url: profileData?.avatar_url,
          level: userData?.level || 1,
          total_xp: userData?.total_xp || 0,
          status: friendship.status,
          isSender: friendship.user_id === user.id,
        };
      });

      setFriends(friendsWithData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  }

  async function acceptFriendRequest(friendId: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('user_id', friendId)
        .eq('friend_id', user.id);

      if (error) throw error;
      loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  }

  async function removeFriend(friendId: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  }

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' ? friend.status === 'accepted' : friend.status === 'pending';
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary/10 p-3 rounded-full">
            <Users className="text-brand-primary" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Friends</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {friends.filter(f => f.status === 'accepted').length} friends
            </p>
          </div>
        </div>

        <Button variant="primary" className="gap-2">
          <UserPlus size={16} />
          Add Friend
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Friends
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-brand-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Pending ({friends.filter(f => f.status === 'pending').length})
        </button>
      </div>

      <div className="space-y-2">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No friends found' : activeTab === 'pending' ? 'No pending requests' : 'No friends yet'}
          </div>
        ) : (
          filteredFriends.map(friend => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              {friend.avatar_url ? (
                <img
                  src={friend.avatar_url}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center">
                  <Users size={24} className="text-white" />
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

              {friend.status === 'pending' && !friend.isSender && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => acceptFriendRequest(friend.id)}
                    className="gap-1"
                  >
                    <UserCheck size={14} />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => removeFriend(friend.id)}
                    className="gap-1"
                  >
                    <UserX size={14} />
                    Decline
                  </Button>
                </div>
              )}

              {friend.status === 'accepted' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => removeFriend(friend.id)}
                  className="gap-1"
                >
                  <UserX size={14} />
                  Remove
                </Button>
              )}

              {friend.status === 'pending' && friend.isSender && (
                <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
