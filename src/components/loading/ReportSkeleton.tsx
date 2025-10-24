'use client';

import { motion } from 'framer-motion';
import { FileText, User, Stethoscope, CheckSquare } from 'lucide-react';

interface ReportSkeletonProps {
  progress: number;
}

export function ReportSkeleton({ progress }: ReportSkeletonProps) {
  const sections = [
    { name: 'Patient Information', icon: User, minProgress: 0 },
    { name: 'Clinical History', icon: Stethoscope, minProgress: 20 },
    { name: 'Technique & Protocol', icon: FileText, minProgress: 35 },
    { name: 'Detailed Findings', icon: FileText, minProgress: 50 },
    { name: 'Impression & Recommendations', icon: CheckSquare, minProgress: 75 }
  ];

  return (
    <div className="aurora-card border border-[rgba(255,255,255,0.08)] overflow-hidden">
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <FileText className="h-5 w-5" />
          Report structure preview
        </h3>
        <p className="mt-1 text-sm text-[rgba(207,207,207,0.65)]">Sections assembling in real time.</p>
      </div>

      <div className="space-y-4 p-6">
        {sections.map((section, index) => {
          const isGenerated = progress >= section.minProgress;
          const Icon = section.icon;

          return (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.12 }}
              className={`rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.7)] px-4 py-3 transition-colors ${isGenerated ? 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.15)] shadow-[0_12px_28px_rgba(63,191,140,0.25)]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isGenerated ? 'bg-[linear-gradient(135deg,#3FBF8C,#6EE7B7)] text-white' : 'bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.55)]'}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h4 className={`text-sm font-semibold ${isGenerated ? 'text-white' : 'text-[rgba(207,207,207,0.55)]'}`}>
                  {section.name}
                </h4>
                {isGenerated && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                    <CheckSquare className="h-5 w-5 text-[#7AE7B4]" />
                  </motion.div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {isGenerated ? (
                  <>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                      className="h-2 rounded bg-[rgba(63,191,140,0.35)]"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '90%' }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="h-2 rounded bg-[rgba(63,191,140,0.3)]"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-2 rounded bg-[rgba(63,191,140,0.25)]"
                    />
                  </>
                ) : (
                  <>
                    <div className="h-2 rounded bg-[rgba(207,207,207,0.2)] animate-pulse" />
                    <div className="h-2 w-[90%] rounded bg-[rgba(207,207,207,0.2)] animate-pulse" />
                    <div className="h-2 w-[75%] rounded bg-[rgba(207,207,207,0.2)] animate-pulse" />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-6 py-3 text-center text-xs text-[rgba(207,207,207,0.55)]">
        {progress < 100
          ? `Generating report structure… ${Math.round(progress)}% complete`
          : 'Report generation complete! Loading…'}
      </div>
    </div>
  );
}
