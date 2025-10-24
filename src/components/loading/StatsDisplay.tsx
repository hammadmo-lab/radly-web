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
      accent: 'from-[rgba(75,142,255,0.16)] to-[rgba(75,142,255,0.35)]',
      iconGlow: 'bg-[linear-gradient(135deg,#2653FF,#4B8EFF)]',
      show: startTime !== null
    },
    {
      icon: FileText,
      label: 'Words Generated',
      value: estimatedWords > 0 ? `~${estimatedWords}` : '0',
      accent: 'from-[rgba(63,191,140,0.16)] to-[rgba(63,191,140,0.32)]',
      iconGlow: 'bg-[linear-gradient(135deg,#3FBF8C,#6EE7B7)]',
      show: jobStatus === 'running' || jobStatus === 'done'
    },
    {
      icon: TrendingUp,
      label: 'Status',
      value: jobStatus === 'done' ? 'Complete' : jobStatus === 'running' ? 'Processing' : 'Queued',
      accent: 'from-[rgba(248,183,77,0.16)] to-[rgba(248,183,77,0.32)]',
      iconGlow: 'bg-[linear-gradient(135deg,#F8B74D,#FF6B6B)]',
      show: true
    },
    {
      icon: Zap,
      label: 'Est. Remaining',
      value: estimatedSeconds ? `~${estimatedSeconds}s` : 'Calculating…',
      accent: 'from-[rgba(143,130,255,0.16)] to-[rgba(143,130,255,0.35)]',
      iconGlow: 'bg-[linear-gradient(135deg,#8F82FF,#B094FF)]',
      show: jobStatus !== 'done' && estimatedSeconds !== undefined
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-2">
      {stats.filter((stat) => stat.show).map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`aurora-card border border-[rgba(255,255,255,0.08)] p-4 sm:p-5 bg-gradient-to-br ${stat.accent}`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconGlow} text-white shadow-[0_14px_32px_rgba(31,64,175,0.35)]`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">{stat.label}</p>
              <motion.p
                key={stat.value}
                initial={{ scale: 1.1, opacity: 0.85 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xl font-semibold text-white"
              >
                {stat.value}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
