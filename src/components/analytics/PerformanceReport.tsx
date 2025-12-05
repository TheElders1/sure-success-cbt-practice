import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { generatePDFReport } from '@/utils/pdfReportGenerator';

export default function PerformanceReport() {
  const { user } = useAuthStore();
  const [generating, setGenerating] = useState(false);

  async function handleGenerateReport() {
    if (!user) return;

    setGenerating(true);
    try {
      const [sessionsRes, subjectsRes, userData] = await Promise.all([
        supabase
          .from('quiz_session_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(10),
        supabase
          .from('subject_performance')
          .select('*')
          .eq('user_id', user.id)
          .order('average_score', { ascending: false }),
        supabase
          .from('users')
          .select('name, study_streak, total_quizzes_taken, average_score')
          .eq('id', user.id)
          .maybeSingle(),
      ]);

      const totalTimeSpent = sessionsRes.data?.reduce(
        (sum, s) => sum + s.time_spent_seconds,
        0
      ) || 0;

      const reportData = {
        userName: userData.data?.name || 'Unknown User',
        reportDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        totalQuizzes: userData.data?.total_quizzes_taken || 0,
        averageScore: Math.round(userData.data?.average_score || 0),
        totalTimeSpent: Math.round(totalTimeSpent / 60),
        studyStreak: userData.data?.study_streak || 0,
        subjectPerformance:
          subjectsRes.data?.map((s) => ({
            subject: s.subject_name,
            score: Math.round(s.average_score),
            attempts: s.total_questions_attempted,
          })) || [],
        recentQuizzes:
          sessionsRes.data?.map((q) => ({
            date: new Date(q.started_at).toLocaleDateString(),
            course: q.course_code || 'Unknown',
            score: Math.round(q.score_percentage),
            timeTaken: Math.round(q.time_spent_seconds / 60),
          })) || [],
      };

      await generatePDFReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-500/10 rounded-full">
          <FileText className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Performance Report
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate a comprehensive PDF report of your progress
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Report Includes:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
              Overall performance statistics
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
              Subject-wise breakdown
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
              Recent quiz history
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
              Study patterns and trends
            </li>
          </ul>
        </div>

        <Button
          variant="primary"
          onClick={handleGenerateReport}
          disabled={generating}
          className="w-full gap-2"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download size={16} />
              Generate PDF Report
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
