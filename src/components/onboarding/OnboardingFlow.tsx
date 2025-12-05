import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, BookOpen, Trophy, Users, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function OnboardingFlow() {
  const { user } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Sure Success CBT!',
      description: 'Your comprehensive exam preparation platform',
      icon: <BookOpen size={48} className="text-brand-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Sure Success CBT helps you prepare for your exams with interactive quizzes,
            comprehensive analytics, and a supportive community.
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full" />
              Practice with thousands of questions
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full" />
              Track your progress with detailed analytics
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full" />
              Compete with peers on leaderboards
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full" />
              Join study groups and forums
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'quizzes',
      title: 'Take Quizzes',
      description: 'Practice makes perfect',
      icon: <Target size={48} className="text-blue-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Access a wide range of quizzes tailored to your course. Each quiz provides:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Timed Practice
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Simulate real exam conditions with countdown timers
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                Instant Feedback
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get immediate explanations for correct answers
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">
                Progress Tracking
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor your improvement over time
              </p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                Review Mode
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Go back and review your answers
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'analytics',
      title: 'Track Your Progress',
      description: 'Data-driven improvement',
      icon: <Trophy size={48} className="text-yellow-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Your dashboard provides comprehensive insights into your performance:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Performance Charts
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visual graphs showing your progress over time
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Subject Breakdown
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify your strengths and areas for improvement
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Study Heatmap
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualize your study patterns and consistency
                </p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: 'Learn together, succeed together',
      icon: <Users size={48} className="text-green-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Connect with fellow students and enhance your learning experience:
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Discussion Forums
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions, share knowledge, and help others in course-specific forums
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Study Groups
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Form or join study groups to collaborate and stay motivated
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Leaderboards
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compete friendly with peers and climb the rankings
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  async function checkOnboardingStatus() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        await supabase.from('user_onboarding_progress').insert({
          user_id: user.id,
          current_step: 'welcome',
        });
        setShowOnboarding(true);
      } else if (!data.is_completed && !data.skipped) {
        setShowOnboarding(true);
        const stepIndex = steps.findIndex((s) => s.id === data.current_step);
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProgress(stepId: string) {
    if (!user) return;

    try {
      await supabase
        .from('user_onboarding_progress')
        .update({
          current_step: stepId,
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  async function completeOnboarding() {
    if (!user) return;

    try {
      await supabase
        .from('user_onboarding_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  async function skipOnboarding() {
    if (!user) return;

    try {
      await supabase
        .from('user_onboarding_progress')
        .update({
          skipped: true,
        })
        .eq('user_id', user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      updateProgress(steps[nextStepIndex].id);
    } else {
      completeOnboarding();
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      updateProgress(steps[prevStepIndex].id);
    }
  }

  if (loading || !showOnboarding) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <Card variant="elevated" padding="lg" className="relative">
            <button
              onClick={skipOnboarding}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Skip tutorial"
            >
              <X size={20} />
            </button>

            <div className="mb-6 flex items-center justify-center">
              {currentStepData.icon}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {currentStepData.description}
            </p>

            <div className="mb-8">{currentStepData.content}</div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`h-2 w-12 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-brand-primary'
                        : index < currentStep
                        ? 'bg-brand-primary/50'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep + 1} / {steps.length}
              </span>
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  onClick={previousStep}
                  className="gap-2 flex-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
              )}
              <Button
                variant="primary"
                onClick={nextStep}
                className="gap-2 flex-1"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ChevronRight size={16} />
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
