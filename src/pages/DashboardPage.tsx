import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Award,
  Flame,
  Star,
  Trophy,
  BookOpen,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [quizResults, userAchievements] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user?.id)
          .order('unlocked_at', { ascending: false }),
      ]);

      if (quizResults.data) setQuizHistory(quizResults.data);
      if (userAchievements.data) setAchievements(userAchievements.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerTitle="Performance Dashboard" headerSubtitle={`${user?.name}'s Analytics`}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-brand-primary" />
            Your Stats
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Target}
              label="Total Quizzes"
              value={user?.totalQuizzes || 0}
              iconColor="text-blue-600"
              delay={0}
            />
            <StatCard
              icon={TrendingUp}
              label="Average Score"
              value={`${user?.averageScore || 0}%`}
              iconColor="text-green-600"
              delay={0.1}
            />
            <StatCard
              icon={Trophy}
              label="Perfect Scores"
              value={user?.perfectScores || 0}
              iconColor="text-yellow-600"
              delay={0.2}
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${user?.studyStreak || 0} days`}
              iconColor="text-orange-600"
              delay={0.3}
            />
            <StatCard
              icon={Star}
              label="Level"
              value={user?.level || 1}
              iconColor="text-purple-600"
              delay={0.4}
            />
            <StatCard
              icon={Award}
              label="Total XP"
              value={user?.totalXP || 0}
              iconColor="text-indigo-600"
              delay={0.5}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="text-brand-primary" />
              Achievements
            </h2>
            <Card variant="elevated" padding="lg">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading achievements...
                </div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Start taking quizzes to unlock achievements!
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="bg-yellow-500/10 p-2 rounded-lg">
                        <Trophy className="text-yellow-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {achievement.achievement_id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="text-brand-primary" />
              Recent Quizzes
            </h2>
            <Card variant="elevated" padding="lg">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading quiz history...
                </div>
              ) : quizHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No quiz history yet. Take your first quiz!
                </div>
              ) : (
                <div className="space-y-3">
                  {quizHistory.slice(0, 10).map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-primary/10 p-2 rounded-lg">
                          <BookOpen className="text-brand-primary" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {quiz.course_code} - Segment {quiz.segment_number}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(quiz.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          quiz.percentage >= 80
                            ? 'text-green-600 dark:text-green-400'
                            : quiz.percentage >= 50
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {quiz.percentage}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
