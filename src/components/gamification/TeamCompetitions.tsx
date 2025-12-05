import { useState, useEffect } from 'react';
import { Users, Trophy, TrendingUp, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface Competition {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'upcoming';
  competition_type: 'department' | 'faculty' | 'global';
}

interface TeamScore {
  team_identifier: string;
  total_score: number;
  participant_count: number;
  average_score: number;
  rank: number;
}

export default function TeamCompetitions() {
  const { user } = useAuthStore();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (selectedComp) {
      loadTeamScores(selectedComp.id);
    }
  }, [selectedComp]);

  async function loadCompetitions() {
    try {
      const { data } = await supabase
        .from('team_competitions')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_date', { ascending: false });

      setCompetitions(data || []);
      if (data && data.length > 0) {
        setSelectedComp(data[0]);
      }
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTeamScores(competitionId: string) {
    try {
      const { data } = await supabase
        .from('team_competition_scores')
        .select('*')
        .eq('competition_id', competitionId)
        .order('total_score', { ascending: false });

      const rankedScores = data?.map((score, index) => ({
        ...score,
        rank: index + 1,
      })) || [];

      setTeamScores(rankedScores);
    } catch (error) {
      console.error('Error loading team scores:', error);
    }
  }

  function getRankMedal(rank: number) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  if (competitions.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Active Competitions
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back soon for team competitions and challenges!
          </p>
        </div>
      </Card>
    );
  }

  const userDepartment = user?.department;
  const userTeam = teamScores.find(t => t.team_identifier === userDepartment);

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Team Competitions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compete with other departments and climb the rankings
            </p>
          </div>
        </div>

        {selectedComp && (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {selectedComp.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedComp.description}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedComp.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {selectedComp.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>
                  {new Date(selectedComp.start_date).toLocaleDateString()} - {new Date(selectedComp.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span className="capitalize">{selectedComp.competition_type}</span>
              </div>
            </div>
          </div>
        )}

        {userTeam && (
          <Card variant="elevated" padding="md" className="mb-6 bg-gradient-to-r from-brand-primary/10 to-blue-500/10 border-2 border-brand-primary">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Your Team</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{userTeam.team_identifier}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getRankMedal(userTeam.rank)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {userTeam.total_score.toLocaleString()} pts
                </div>
              </div>
            </div>
          </Card>
        )}
      </Card>

      <Card variant="elevated" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {teamScores.map((team) => (
                <tr
                  key={team.team_identifier}
                  className={`transition-colors ${
                    team.team_identifier === userDepartment
                      ? 'bg-brand-primary/5'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl">{getRankMedal(team.rank)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        team.team_identifier === userDepartment
                          ? 'text-brand-primary'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {team.team_identifier}
                      </span>
                      {team.team_identifier === userDepartment && (
                        <span className="px-2 py-0.5 text-xs bg-brand-primary text-white rounded-full">
                          Your Team
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="font-bold text-gray-900 dark:text-white">
                        {team.total_score.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600 dark:text-gray-400">
                    {team.participant_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(team.average_score)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
