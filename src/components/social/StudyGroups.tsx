import { useState, useEffect } from 'react';
import { Users, Plus, Lock, Globe, Crown, UserPlus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  is_private: boolean;
  member_count: number;
  is_member: boolean;
  is_admin: boolean;
  created_by: string;
}

export default function StudyGroups() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_private: false,
  });

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  async function loadGroups() {
    if (!user) return;

    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      const { data: membershipsData } = await supabase
        .from('study_group_members')
        .select('group_id, role')
        .eq('user_id', user.id);

      const membershipMap = new Map(
        membershipsData?.map(m => [m.group_id, m.role]) || []
      );

      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            avatar_url: group.avatar_url,
            is_private: group.is_private,
            member_count: count || 0,
            is_member: membershipMap.has(group.id),
            is_admin: membershipMap.get(group.id) === 'admin',
            created_by: group.created_by,
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createGroup() {
    if (!user || !newGroup.name.trim()) return;

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          is_private: newGroup.is_private,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      await supabase.from('study_group_members').insert({
        group_id: groupData.id,
        user_id: user.id,
        role: 'admin',
      });

      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', is_private: false });
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }

  async function joinGroup(groupId: string) {
    if (!user) return;

    try {
      const { error } = await supabase.from('study_group_members').insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      });

      if (error) throw error;

      await supabase.from('group_activities').insert({
        group_id: groupId,
        user_id: user.id,
        activity_type: 'joined_group',
        activity_data: { user_name: user.name },
      });

      loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  }

  async function leaveGroup(groupId: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      loadGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
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

  return (
    <>
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-full">
              <Users className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Study Groups</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {groups.filter(g => g.is_member).length} joined
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Create Group
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <Card key={group.id} variant="default" padding="md" hoverable>
              <div className="flex items-start gap-3">
                {group.avatar_url ? (
                  <img
                    src={group.avatar_url}
                    alt={group.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                    <Users size={32} className="text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {group.name}
                    </h4>
                    {group.is_private ? (
                      <Lock size={16} className="text-gray-400 flex-shrink-0" />
                    ) : (
                      <Globe size={16} className="text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {group.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                    </span>

                    {group.is_member ? (
                      <div className="flex items-center gap-2">
                        {group.is_admin && (
                          <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                            <Crown size={12} />
                            Admin
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => leaveGroup(group.id)}
                        >
                          Leave
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => joinGroup(group.id)}
                        className="gap-1"
                      >
                        <UserPlus size={14} />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {groups.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-600 dark:text-gray-400">
              No study groups yet. Create one to get started!
            </div>
          )}
        </div>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card variant="elevated" padding="lg" className="max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Study Group
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Describe your study group"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={newGroup.is_private}
                  onChange={(e) => setNewGroup({ ...newGroup, is_private: e.target.checked })}
                  className="w-4 h-4 text-brand-primary"
                />
                <label htmlFor="is_private" className="text-sm text-gray-700 dark:text-gray-300">
                  Make this group private
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={createGroup}
                  className="flex-1"
                  disabled={!newGroup.name.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
