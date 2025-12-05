import { useState, useEffect } from 'react';
import { Tag, FolderTree } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface QuestionCategory {
  id: string;
  name: string;
  color: string;
}

interface QuestionTag {
  id: string;
  name: string;
  color: string;
}


export default function QuestionManager() {
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [tags, setTags] = useState<QuestionTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    difficulty: 'all',
    category: 'all',
    mediaType: 'all',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        supabase.from('question_categories').select('*'),
        supabase.from('question_tags').select('*'),
      ]);

      setCategories(categoriesRes.data || []);
      setTags(tagsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    const name = prompt('Enter category name:');
    if (!name) return;

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

    try {
      const { error } = await supabase
        .from('question_categories')
        .insert({ name, color });

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  }

  async function createTag() {
    const name = prompt('Enter tag name:');
    if (!name) return;

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

    try {
      const { error } = await supabase
        .from('question_tags')
        .insert({ name, color });

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  }


  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Question Management
          </h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={createCategory} className="gap-2">
              <FolderTree size={16} />
              New Category
            </Button>
            <Button variant="secondary" onClick={createTag} className="gap-2">
              <Tag size={16} />
              New Tag
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Media Type
            </label>
            <select
              value={filter.mediaType}
              onChange={(e) => setFilter({ ...filter, mediaType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="none">Text Only</option>
              <option value="image">With Images</option>
              <option value="video">With Videos</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Categories</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {categories.length} total
            </span>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 text-sm text-gray-900 dark:text-white">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Tags</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {tags.length} total
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                <Tag size={12} />
                {tag.name}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Question Statistics
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Easy</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Medium</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hard</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Expert</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
