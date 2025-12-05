import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export default function StudyHeatmap() {
  const { user } = useAuthStore();
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    if (!user) return;

    try {
      const { data: activityData } = await supabase
        .from('daily_activity')
        .select('activity_date, quizzes_taken')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: true })
        .limit(84);

      const heatmapData: HeatmapDay[] = [];
      const today = new Date();

      for (let i = 83; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const activity = activityData?.find(
          (a) => a.activity_date === dateStr
        );
        const count = activity?.quizzes_taken || 0;

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count === 0) level = 0;
        else if (count <= 2) level = 1;
        else if (count <= 4) level = 2;
        else if (count <= 6) level = 3;
        else level = 4;

        heatmapData.push({ date: dateStr, count, level });
      }

      setData(heatmapData);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }
  const getLevelColor = (level: number) => {
    const colors = {
      0: 'bg-gray-100 dark:bg-gray-800',
      1: 'bg-blue-200 dark:bg-blue-900',
      2: 'bg-blue-400 dark:bg-blue-700',
      3: 'bg-blue-600 dark:bg-blue-500',
      4: 'bg-blue-800 dark:bg-blue-400',
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  const groupByWeeks = () => {
    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    data.forEach((day, index) => {
      currentWeek.push(day);
      if ((index + 1) % 7 === 0 || index === data.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const weeks = groupByWeeks();

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Study Activity</h3>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-full">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-4 h-4 rounded-sm ${getLevelColor(day.level)} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
                  title={`${day.date}: ${day.count} ${day.count === 1 ? 'quiz' : 'quizzes'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}
