import { motion } from 'framer-motion';
import { GraduationCap, Target, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function AboutPage() {
  const { user } = useAuthStore();

  return (
    <Layout headerTitle="About Us" headerSubtitle="Learn more about Sure Success CBT">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" padding="lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About Sure Success CBT Practice
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Sure Success CBT Practice is a comprehensive online platform designed to help
              students prepare effectively for their Computer-Based Tests. Our platform offers
              a wide range of courses across multiple departments including Computer Science,
              Cyber Security, Data Science, Information Technology, and Software Engineering.
            </p>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" padding="lg" className="h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-brand-primary/10 p-4 rounded-full">
                  <GraduationCap className="text-brand-primary" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quality Education
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access high-quality practice questions curated by experts to ensure
                  comprehensive learning and exam preparation.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" padding="lg" className="h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-green-500/10 p-4 rounded-full">
                  <Target className="text-green-600" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Targeted Practice
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Practice with purpose using our adaptive learning system that identifies
                  and focuses on your weak areas for maximum improvement.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated" padding="lg" className="h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-500/10 p-4 rounded-full">
                  <Users className="text-blue-600" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Student-Focused
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Built by students, for students. We understand the challenges and
                  provide tools that actually help you succeed.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="elevated" padding="lg" className="h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-purple-500/10 p-4 rounded-full">
                  <TrendingUp className="text-purple-600" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Track Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your improvement with detailed analytics, performance trends,
                  and achievement tracking to stay motivated.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="elevated" padding="lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our mission is to provide accessible, effective, and engaging practice tools
              that empower students to achieve academic excellence. We believe that with
              the right preparation and practice, every student can succeed. Through
              continuous improvement and feedback from our community, we strive to create
              the best possible learning experience.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Link to={user ? '/home' : '/'}>
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft size={18} />}
            >
              {user ? 'Back to Home' : 'Back to Login'}
            </Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
