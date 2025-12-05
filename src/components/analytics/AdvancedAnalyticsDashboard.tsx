import { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import PerformanceChart from './PerformanceChart';
import SubjectBreakdown from './SubjectBreakdown';
import StudyHeatmap from './StudyHeatmap';
import LeaderboardCard from './LeaderboardCard';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface Analytics {
  totalQuizzes: number;
  averageScore: number;
  totalTimeSpent: number;
  improvementRate: number;
  currentStreak: number;
  longestStreak: number;
}

export default function AdvancedAnalyticsDashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalQuizzes: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    improvementRate: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  async function loadAnalytics() {
    if (!user) return;

    try {
      const { data: sessionsData } = await supabase
        .from('quiz_session_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      const totalQuizzes = sessionsData?.length || 0;
      const averageScore = sessionsData?.length
        ? sessionsData.reduce((sum, s) => sum + s.score_percentage, 0) / sessionsData.length
        : 0;
      const totalTimeSpent = sessionsData?.reduce((sum, s) => sum + s.time_spent_seconds, 0) || 0;

      const recentSessions = sessionsData?.slice(0, 5) || [];
      const olderSessions = sessionsData?.slice(5, 10) || [];
      const recentAvg = recentSessions.length
        ? recentSessions.reduce((sum, s) => sum + s.score_percentage, 0) / recentSessions.length
        : 0;
      const olderAvg = olderSessions.length
        ? olderSessions.reduce((sum, s) => sum + s.score_percentage, 0) / olderSessions.length
        : 0;
      const improvementRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

      const { data: userData } = await supabase
        .from('users')
        .select('study_streak, longest_streak')
        .eq('id', user.id)
        .maybeSingle();

      setAnalytics({
        totalQuizzes,
        averageScore: Math.round(averageScore),
        totalTimeSpent: Math.round(totalTimeSpent / 60),
        improvementRate: Math.round(improvementRate),
        currentStreak: userData?.study_streak || 0,
        longestStreak: userData?.longest_streak || 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive insights into your learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Quizzes"
          value={analytics.totalQuizzes}
          icon={Target}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Average Score"
          value={`${analytics.averageScore}%`}
          icon={Award}
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Time Spent"
          value={`${analytics.totalTimeSpent}m`}
          icon={Clock}
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Study Streak"
          value={`${analytics.currentStreak} days`}
          icon={TrendingUp}
          iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <LeaderboardCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubjectBreakdown />
        <StudyHeatmap />
      </div>

      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Performance Insights
        </h3>
        <div className="space-y-3">
          {analytics.improvementRate > 5 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                    Great Progress!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Your performance has improved by {analytics.improvementRate}% in recent quizzes. Keep up the excellent work!
                  </p>
                </div>
              </div>
            </div>
          )}
          {analytics.currentStreak >= 7 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Award className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                    Impressive Streak!
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    You've maintained a {analytics.currentStreak}-day study streak. Consistency is key to success!
                  </p>
                </div>
              </div>
            </div>
          )}
          {analytics.averageScore < 50 && analytics.totalQuizzes > 5 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Room for Improvement
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Focus on your weak areas and review explanations. Consider joining study groups for support.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
