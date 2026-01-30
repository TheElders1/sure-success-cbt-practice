import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Target,
  Flame,
  Star,
  TrendingUp,
  BarChart3,
  Award,
  Clock,
  Trophy,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import DailyChallenges from '@/components/gamification/DailyChallenges';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import StreakMultiplier from '@/components/gamification/StreakMultiplier';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

const courses = [
  { code: 'CSC121', name: 'Introduction to Computer Science' },
  { code: 'CSC122', name: 'Computer Science II' },
  { code: 'CYB121', name: 'Cyber Security Fundamentals' },
  { code: 'CYB122', name: 'Advanced Cyber Security' },
  { code: 'DTS121', name: 'Data Science Basics' },
  { code: 'DTS122', name: 'Advanced Data Science' },
  { code: 'IFT121', name: 'Information Technology I' },
  { code: 'IFT122', name: 'Information Technology II' },
  { code: 'SEN121', name: 'Software Engineering I' },
  { code: 'SEN122', name: 'Software Engineering II' },
  { code: 'COS121', name: 'Computer Operations' },
  { code: 'GST121', name: 'General Studies' },
  { code: 'MTH121', name: 'Mathematics I' },
  { code: 'PHY121', name: 'Physics I' },
  { code: 'PHY122', name: 'Physics II' },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentQuizzes();
    }
  }, [user]);

  const fetchRecentQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching recent quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (selectedCourse) {
      navigate(`/quiz/${selectedCourse}`);
    }
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Layout headerTitle="Home" headerSubtitle={`Welcome back, ${user?.name}!`}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-brand-primary to-brand-hover text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
              <p className="text-white/90">Department: {user?.department}</p>
            </div>
            <div className="hidden sm:flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{user?.level || 1}</div>
                <div className="text-sm text-white/80">Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{user?.totalXP || 0}</div>
                <div className="text-sm text-white/80">Total XP</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="text-brand-primary" />
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="elevated" padding="lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-brand-primary/10 p-4 rounded-full">
                    <BookOpen className="text-brand-primary" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Take a Quiz
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Select a course and start practicing immediately
                </p>
                <div className="space-y-3">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course.code} value={course.code}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={!selectedCourse}
                    onClick={handleStartQuiz}
                    rightIcon={<Target size={18} />}
                  >
                    Start Quiz
                  </Button>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-blue-500/10 p-4 rounded-full">
                    <BarChart3 className="text-blue-600 dark:text-blue-400" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  View Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Detailed performance analysis and insights
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full mt-auto"
                  onClick={handleViewDashboard}
                  rightIcon={<TrendingUp size={18} />}
                >
                  View Dashboard
                </Button>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-500/10 p-4 rounded-full">
                    <Target className="text-green-600 dark:text-green-400" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Practice Weak Areas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Focus on topics that need improvement
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full mt-auto"
                  disabled
                  rightIcon={<Award size={18} />}
                >
                  Coming Soon
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-brand-primary" />
            Performance Overview
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              icon={Flame}
              label="Day Streak"
              value={user?.studyStreak || 0}
              iconColor="text-orange-600"
              delay={0.2}
            />
            <StatCard
              icon={Star}
              label="Level"
              value={user?.level || 1}
              iconColor="text-purple-600"
              delay={0.3}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="text-brand-primary" />
              Daily Challenge
            </h2>
            <DailyChallenges />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Flame className="text-brand-primary" />
              Streak Bonus
            </h2>
            <StreakMultiplier streak={user?.studyStreak || 0} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="text-brand-primary" />
              Achievements & Badges
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/achievements')}
              rightIcon={<ArrowRight size={16} />}
            >
              View All
            </Button>
          </div>
          <BadgeDisplay />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="text-brand-primary" />
              Team Competitions
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/competitions')}
              rightIcon={<ArrowRight size={16} />}
            >
              View Leaderboard
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="elevated" padding="lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-full">
                    <Users className="text-white" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Department Rankings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Compete with other departments and climb the rankings
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('/competitions')}
                  rightIcon={<Trophy size={18} />}
                >
                  View Rankings
                </Button>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-full">
                    <Award className="text-white" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Achievements
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track progress toward exclusive badges and rewards
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('/achievements')}
                  rightIcon={<Star size={18} />}
                >
                  View All Achievements
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="text-brand-primary" />
            Recent Activity
          </h2>
          <Card variant="elevated" padding="lg">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading recent activity...
              </div>
            ) : recentQuizzes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No quiz history yet. Take your first quiz to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-primary/10 p-2 rounded-lg">
                        <BookOpen className="text-brand-primary" size={24} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {quiz.course_code} - Segment {quiz.segment_number}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          quiz.percentage >= 80
                            ? 'text-green-600 dark:text-green-400'
                            : quiz.percentage >= 50
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {quiz.percentage}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {quiz.score}/{quiz.total_questions}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
