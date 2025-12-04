import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, GraduationCap, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let email = emailOrUsername;

      if (!emailOrUsername.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername.toLowerCase())
          .maybeSingle();

        if (userError) throw userError;

        if (!userData) {
          setError('Username not found');
          setLoading(false);
          return;
        }

        email = userData.email;
      }

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (!authData.user) {
        throw new Error('Login failed');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        throw new Error('User profile not found');
      }

      if (profileData.account_status === 'suspended') {
        await supabase.auth.signOut();
        setError('Your account has been suspended. Please contact support.');
        setLoading(false);
        return;
      }

      if (!profileData.email_verified) {
        setError('Please verify your email address before logging in.');
        setLoading(false);
        return;
      }

      await supabase
        .from('users')
        .update({ last_visit: new Date().toISOString() })
        .eq('id', authData.user.id);

      setUser({
        id: profileData.id,
        name: profileData.name,
        department: profileData.department,
        totalXP: profileData.total_xp || 0,
        level: profileData.level || 1,
        studyStreak: profileData.study_streak || 0,
        longestStreak: profileData.longest_streak || 0,
        totalQuizzes: profileData.total_quizzes_taken || 0,
        perfectScores: profileData.perfect_scores || 0,
        averageScore: Number(profileData.average_score) || 0,
        lastVisit: profileData.last_visit,
      });

      navigate('/home');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email/username or password');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
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
                <div className="flex justify-center mb-4">
                  <div className="bg-brand-primary/10 p-4 rounded-full">
                    <LogIn className="text-brand-primary" size={40} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Login with your email or username
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="emailOrUsername"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email or Username
                  </label>
                  <input
                    id="emailOrUsername"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-brand-primary hover:text-brand-hover font-semibold transition-colors"
                    >
                      Register here
                    </Link>
                  </p>
                </div>
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
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Faculties</div>
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
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <TrendingUp className="text-orange-600 dark:text-orange-400" size={32} />
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
