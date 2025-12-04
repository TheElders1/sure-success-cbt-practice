import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, GraduationCap, BookOpen, Target, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

const departments = [
  { value: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { value: 'Cyber Security', label: 'Cyber Security', icon: '🔒' },
  { value: 'Data Science', label: 'Data Science', icon: '📊' },
  { value: 'Information Technology', label: 'Information Technology', icon: '💼' },
  { value: 'Software Engineering', label: 'Software Engineering', icon: '⚙️' },
];

export default function LoginPage() {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.length < 6) {
      setError('Name must be at least 6 characters long');
      return;
    }

    if (!department) {
      setError('Please select a department');
      return;
    }

    setLoading(true);

    try {
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .eq('department', department);

      if (fetchError) throw fetchError;

      let userData;

      if (existingUsers && existingUsers.length > 0) {
        userData = existingUsers[0];
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_visit: new Date().toISOString() })
          .eq('id', userData.id);

        if (updateError) throw updateError;
      } else {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              name,
              department,
              email: `${name.toLowerCase().replace(/\s+/g, '_')}@temp.com`,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        userData = newUser;
      }

      setUser({
        id: userData.id,
        name: userData.name,
        department: userData.department,
        totalXP: userData.total_xp || 0,
        level: userData.level || 1,
        studyStreak: userData.study_streak || 0,
        longestStreak: userData.longest_streak || 0,
        totalQuizzes: userData.total_quizzes_taken || 0,
        perfectScores: userData.perfect_scores || 0,
        averageScore: Number(userData.average_score) || 0,
        lastVisit: userData.last_visit,
      });

      navigate('/home');
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerTitle="Sure Success CBT" headerSubtitle="Login to Your Account">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="elevated" padding="lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your details to access your personalized dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                  {name.length > 0 && name.length < 6 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {6 - name.length} more character{6 - name.length > 1 ? 's' : ''} needed
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Department
                  </label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    required
                  >
                    <option value="">-- Please choose a department --</option>
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.icon} {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  rightIcon={<Target size={20} />}
                >
                  Login to Dashboard
                </Button>
              </form>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <div className="bg-brand-primary/10 p-3 rounded-lg">
                  <GraduationCap className="text-brand-primary" size={32} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Departments</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <BookOpen className="text-green-600 dark:text-green-400" size={32} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">15+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Courses Available</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <Target className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">100</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Questions per Course</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">∞</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Progress Tracking</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
