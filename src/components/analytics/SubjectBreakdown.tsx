import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface SubjectData {
  subject: string;
  score: number;
  attempts: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SubjectBreakdown() {
  const { user } = useAuthStore();
  const [data, setData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    if (!user) return;

    try {
      const { data: subjectData } = await supabase
        .from('subject_performance')
        .select('subject_name, average_score, total_questions_attempted')
        .eq('user_id', user.id)
        .order('average_score', { ascending: false })
        .limit(6);

      const chartData = subjectData?.map((item) => ({
        subject: item.subject_name.length > 15 ? item.subject_name.substring(0, 15) + '...' : item.subject_name,
        score: Math.round(item.average_score),
        attempts: item.total_questions_attempted,
      })) || [];

      setData(chartData);
    } catch (error) {
      console.error('Error loading subject data:', error);
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
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Subject Performance</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-600 dark:text-gray-400">
          No subject data available yet. Take some quizzes to see your performance by subject!
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis
                dataKey="subject"
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
              <Bar dataKey="score" radius={[8, 8, 0, 0]} name="Average Score (%)">
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((subject, index) => (
              <div key={subject.subject} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {subject.subject}: {subject.attempts} attempts
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
