import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';

const faqs = [
  {
    question: 'How do I get started with Sure Success CBT?',
    answer:
      'Simply create an account by entering your name and selecting your department on the login page. Once logged in, you can immediately start taking practice quizzes from our extensive course library.',
  },
  {
    question: 'How many questions are in each quiz?',
    answer:
      'Each quiz contains 50 carefully selected questions from a pool of 100 questions per segment. The questions are randomized to ensure a unique experience every time you take a quiz.',
  },
  {
    question: 'Can I review my answers after completing a quiz?',
    answer:
      'Yes! After submitting your quiz, you can review all questions, see which ones you got correct or incorrect, and learn from your mistakes. You can also filter to see only the questions you marked for review.',
  },
  {
    question: 'How is my score calculated?',
    answer:
      'Your score is calculated as a percentage based on the number of questions you answered correctly out of the total questions in the quiz. For example, if you get 40 out of 50 questions correct, your score is 80%.',
  },
  {
    question: 'What is the XP and leveling system?',
    answer:
      'XP (Experience Points) is earned by completing quizzes. The amount of XP you earn depends on your score, speed, and whether you achieved a perfect score. As you accumulate XP, your level increases, showing your progress and dedication.',
  },
  {
    question: 'How does the study streak work?',
    answer:
      'Your study streak increases by 1 each consecutive day you take at least one quiz. If you miss a day, your streak resets to 0. Maintaining a study streak is a great way to build consistent study habits!',
  },
  {
    question: 'Can I take the same quiz multiple times?',
    answer:
      'Yes! You can retake quizzes as many times as you want. Each attempt will have different questions selected from the question pool, giving you varied practice opportunities.',
  },
  {
    question: 'Is my progress saved automatically?',
    answer:
      'Yes, all your quiz results, achievements, and progress are automatically saved to your account. You can access your performance history anytime from the dashboard.',
  },
  {
    question: 'What are achievements?',
    answer:
      'Achievements are special badges you earn by reaching milestones such as completing your first quiz, maintaining study streaks, scoring perfect scores, and more. They help gamify your learning experience and keep you motivated!',
  },
  {
    question: 'How can I improve my weak areas?',
    answer:
      'The platform tracks questions you answer incorrectly and identifies patterns in your weak areas. You can view these in your dashboard and focus your practice on topics that need the most improvement.',
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout headerTitle="Help Center" headerSubtitle="Find answers to common questions">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="text-brand-primary" size={40} />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
              Can't find what you're looking for? Contact our support team for assistance.
            </p>
          </Card>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="default" padding="none">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-xl"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="flex-shrink-0 text-brand-primary" size={24} />
                  ) : (
                    <ChevronDown className="flex-shrink-0 text-gray-400" size={24} />
                  )}
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="elevated" padding="lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Still Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              If you couldn't find the answer to your question, please don't hesitate to
              contact our support team. We're here to help!
            </p>
            <div className="flex justify-center">
              <a
                href="/contact"
                className="text-brand-primary hover:text-brand-hover font-semibold transition-colors"
              >
                Contact Support →
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
