import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Pin, Lock, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  course_code: string | null;
  icon: string;
  color: string;
  thread_count: number;
  post_count: number;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
}

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadThreads(selectedCategory);
    }
  }, [selectedCategory]);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('position');

      if (error) throw error;

      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count: threadCount } = await supabase
            .from('forum_threads')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          const { data: threadsData } = await supabase
            .from('forum_threads')
            .select('reply_count')
            .eq('category_id', category.id);

          const postCount = threadsData?.reduce((sum, t) => sum + t.reply_count, 0) || 0;

          return {
            ...category,
            thread_count: threadCount || 0,
            post_count: postCount,
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadThreads(categoryId: string) {
    try {
      const { data: threadsData, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      if (error) throw error;

      const authorIds = [...new Set(threadsData?.map((t) => t.author_id) || [])];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name')
        .in('id', authorIds);

      const userMap = new Map(usersData?.map((u) => [u.id, u.name]) || []);

      const threadsWithAuthors = threadsData?.map((thread) => ({
        ...thread,
        author_name: userMap.get(thread.author_id) || 'Unknown',
      })) || [];

      setThreads(threadsWithAuthors);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  }

  if (loading) {
    return (
      <Layout headerTitle="Forum" headerSubtitle="Community Discussions">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerTitle="Forum" headerSubtitle="Community Discussions">
      <div className="max-w-6xl mx-auto">
        {!selectedCategory ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Forum Categories
              </h2>
            </div>

            {categories.map((category) => (
              <Card
                key={category.id}
                variant="elevated"
                padding="lg"
                hoverable
                onClick={() => setSelectedCategory(category.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <MessageSquare
                      size={32}
                      style={{ color: category.color }}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {category.description}
                    </p>
                    {category.course_code && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {category.course_code}
                      </span>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.thread_count}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Threads</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.post_count}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Posts</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="mb-2"
                >
                  Back to Categories
                </Button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </h2>
              </div>
              <Button variant="primary" className="gap-2">
                <Plus size={16} />
                New Thread
              </Button>
            </div>

            <div className="space-y-2">
              {threads.length === 0 ? (
                <Card variant="elevated" padding="lg">
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No threads yet. Be the first to start a discussion!
                  </div>
                </Card>
              ) : (
                threads.map((thread) => (
                  <Card
                    key={thread.id}
                    variant="elevated"
                    padding="md"
                    hoverable
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {thread.is_pinned && (
                            <Pin size={16} className="text-yellow-600 dark:text-yellow-400" />
                          )}
                          {thread.is_locked && (
                            <Lock size={16} className="text-gray-600 dark:text-gray-400" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {thread.title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {thread.content}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <span>By {thread.author_name}</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {thread.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {thread.reply_count}
                          </span>
                          <span>
                            {new Date(thread.last_activity_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
