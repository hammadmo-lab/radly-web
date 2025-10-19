'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Zap, TrendingUp } from 'lucide-react';

interface StatsDisplayProps {
  startTime: number | null;
  jobStatus: 'queued' | 'running' | 'done' | 'error';
  estimatedSeconds?: number;
}

export function StatsDisplay({ startTime, jobStatus, estimatedSeconds }: StatsDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState('0s');
  const [estimatedWords, setEstimatedWords] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsedTime('0s');
      return;
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      if (elapsed < 60) {
        setElapsedTime(`${elapsed}s`);
      } else {
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setElapsedTime(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Simulate word count based on status
  useEffect(() => {
    if (jobStatus === 'queued') {
      setEstimatedWords(0);
    } else if (jobStatus === 'running') {
      const timer = setInterval(() => {
        setEstimatedWords(prev => {
          const next = prev + Math.floor(Math.random() * 20) + 10;
          return Math.min(next, 450); // Cap at ~450 words
        });
      }, 1500);
      return () => clearInterval(timer);
    } else if (jobStatus === 'done') {
      setEstimatedWords(Math.floor(Math.random() * 100) + 350); // Final count 350-450
    }
  }, [jobStatus]);

  const stats = [
    {
      icon: Clock,
      label: 'Elapsed Time',
      value: elapsedTime,
      color: 'blue',
      show: startTime !== null
    },
    {
      icon: FileText,
      label: 'Words Generated',
      value: estimatedWords > 0 ? `~${estimatedWords}` : '0',
      color: 'emerald',
      show: jobStatus === 'running' || jobStatus === 'done'
    },
    {
      icon: TrendingUp,
      label: 'Status',
      value: jobStatus === 'done' ? 'Complete' :
             jobStatus === 'running' ? 'Processing' :
             'Queued',
      color: jobStatus === 'done' ? 'green' :
             jobStatus === 'running' ? 'yellow' :
             'gray',
      show: true
    },
    {
      icon: Zap,
      label: 'Est. Remaining',
      value: estimatedSeconds ? `~${estimatedSeconds}s` : 'Calculating...',
      color: 'violet',
      show: jobStatus !== 'done' && estimatedSeconds !== undefined
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.filter(stat => stat.show).map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100
            rounded-xl p-4 border-2 border-${stat.color}-200
          `}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
            <motion.p
              key={stat.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-2xl font-bold text-${stat.color}-700`}
            >
              {stat.value}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
