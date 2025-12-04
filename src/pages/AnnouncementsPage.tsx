import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Calendar, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  expires_at: string | null;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <XCircle className="w-5 h-5" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700 dark:text-red-400';
      case 'high':
        return 'text-orange-700 dark:text-orange-400';
      case 'medium':
        return 'text-blue-700 dark:text-blue-400';
      default:
        return 'text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading announcements...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-primary/10 p-3 rounded-full">
              <Megaphone className="text-brand-primary" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Announcements
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with the latest news and information
              </p>
            </div>
          </div>
        </motion.div>

        {announcements.length === 0 ? (
          <Card variant="elevated" padding="lg">
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Announcements
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no active announcements at the moment. Check back later!
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`border-2 rounded-xl p-6 ${getPriorityColor(announcement.priority)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${getPriorityTextColor(announcement.priority)} flex-shrink-0`}>
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${getPriorityTextColor(
                            announcement.priority
                          )} bg-white dark:bg-gray-800`}
                        >
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Posted: {new Date(announcement.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {announcement.expires_at && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
