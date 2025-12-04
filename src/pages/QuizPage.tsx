import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { BookOpen } from 'lucide-react';

export default function QuizPage() {
  const { courseCode } = useParams<{ courseCode: string }>();

  return (
    <Layout headerTitle={`Quiz - ${courseCode}`} headerSubtitle="Practice Test">
      <div className="max-w-4xl mx-auto">
        <Card variant="elevated" padding="lg">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-brand-primary/10 p-6 rounded-full">
                <BookOpen className="text-brand-primary" size={64} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quiz Coming Soon
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              The interactive quiz experience is being migrated to the new modern platform.
              This feature will be available shortly with enhanced functionality including:
            </p>
            <div className="mt-6 text-left max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Real-time progress saving</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Adaptive question selection</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Detailed answer explanations</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Enhanced review mode</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Performance analytics</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
