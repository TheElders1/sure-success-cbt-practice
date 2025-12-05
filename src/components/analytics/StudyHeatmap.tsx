import Card from '@/components/ui/Card';

interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface StudyHeatmapProps {
  data: HeatmapDay[];
  title?: string;
}

export default function StudyHeatmap({ data, title = 'Study Activity' }: StudyHeatmapProps) {
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
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>

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
