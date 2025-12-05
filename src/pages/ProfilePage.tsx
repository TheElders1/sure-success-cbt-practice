import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MapPin, Link as LinkIcon, Edit, Shield, Trophy, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  social_links?: Record<string, string>;
  is_public: boolean;
  total_xp: number;
  level: number;
  study_streak: number;
  total_quizzes_taken: number;
  average_score: number;
}

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      setIsOwnProfile(!userId || userId === user?.id);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (userError) throw userError;
      if (!userData) {
        navigate('/home');
        return;
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      setProfile({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar_url: profileData?.avatar_url,
        bio: profileData?.bio,
        location: profileData?.location,
        social_links: profileData?.social_links || {},
        is_public: profileData?.is_public ?? true,
        total_xp: userData.total_xp || 0,
        level: userData.level || 1,
        study_streak: userData.study_streak || 0,
        total_quizzes_taken: userData.total_quizzes_taken || 0,
        average_score: Number(userData.average_score) || 0,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout headerTitle="Profile" headerSubtitle="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout headerTitle="Profile" headerSubtitle="Not Found">
        <Card variant="elevated" padding="lg" className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout headerTitle={profile.name} headerSubtitle="User Profile">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-brand-primary"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center">
                  <User size={64} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Trophy size={16} className="text-yellow-500" />
                      Level {profile.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={16} className="text-blue-500" />
                      {profile.total_xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/profile/edit')}
                    className="gap-2"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </Button>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {profile.location}
                  </span>
                )}
                {!profile.is_public && isOwnProfile && (
                  <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <Shield size={16} />
                    Private Profile
                  </span>
                )}
              </div>

              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(profile.social_links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <LinkIcon size={14} />
                      {platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-primary mb-1">
                {profile.total_quizzes_taken}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {profile.average_score.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {profile.study_streak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {profile.level}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
