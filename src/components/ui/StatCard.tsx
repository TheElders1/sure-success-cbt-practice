import { LucideIcon } from 'lucide-react';
import Card from './Card';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  delay?: number;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = 'text-brand-primary',
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card hoverable padding="md" variant="elevated">
        <div className="flex items-center gap-4">
          <div className={`${iconColor} bg-gray-100 dark:bg-gray-700 p-3 rounded-lg`}>
            <Icon size={28} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {label}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
