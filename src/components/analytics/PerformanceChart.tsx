import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface PerformanceData {
  date: string;
  score: number;
}

export default function PerformanceChart() {
  const { user } = useAuthStore();
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    if (!user) return;

    try {
      const { data: sessionsData } = await supabase
        .from('quiz_session_analytics')
        .select('started_at, score_percentage')
        .eq('user_id', user.id)
        .order('started_at', { ascending: true })
        .limit(30);

      const chartData = sessionsData?.map((session) => ({
        date: new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(session.score_percentage),
      })) || [];

      setData(chartData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance Over Time</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-600 dark:text-gray-400">
          No performance data available yet. Take some quizzes to see your progress!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              className="text-xs text-gray-600 dark:text-gray-400"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Score (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
