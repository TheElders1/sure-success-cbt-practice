import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Copy, Check, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Layout headerTitle="Contact Us" headerSubtitle="Get in touch with us">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" padding="lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              We'd Love to Hear From You
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed text-center">
              Have questions, feedback, or need support? Feel free to reach out to us
              through any of the methods below. We're here to help!
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
                  <Mail className="text-brand-primary" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Email Us
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Send us an email and we'll get back to you as soon as possible.
                </p>
                <div className="w-full space-y-2">
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    suresuccesscbt@gmail.com
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard('suresuccesscbt@gmail.com', 'email')}
                    leftIcon={copiedEmail ? <Check size={16} /> : <Copy size={16} />}
                  >
                    {copiedEmail ? 'Copied!' : 'Copy Email'}
                  </Button>
                </div>
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
                  <Phone className="text-green-600" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Call Us
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Prefer to talk? Give us a call during business hours.
                </p>
                <div className="w-full space-y-2">
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    +234 816 263 8106
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard('+2348162638106', 'phone')}
                    leftIcon={copiedPhone ? <Check size={16} /> : <Copy size={16} />}
                  >
                    {copiedPhone ? 'Copied!' : 'Copy Number'}
                  </Button>
                  <a href="tel:+2348162638106">
                    <Button variant="primary" size="sm" className="w-full">
                      Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-500/10 p-4 rounded-full">
                <MessageCircle className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                WhatsApp Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant support via WhatsApp. We're usually online and ready to help!
              </p>
              <a
                href="https://wa.me/2348162638106"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  leftIcon={<MessageCircle size={20} />}
                >
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" padding="lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Business Hours
            </h3>
            <div className="space-y-2 text-center text-gray-600 dark:text-gray-400">
              <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
              <p>Saturday: 10:00 AM - 2:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Link to="/">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft size={18} />}
            >
              Back to Login
            </Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
