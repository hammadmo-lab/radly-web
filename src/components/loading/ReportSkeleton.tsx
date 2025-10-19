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
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-violet-500 p-6">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Your Report Preview
        </h3>
        <p className="text-white/90 text-sm mt-1">Sections being generated...</p>
      </div>

      {/* Skeleton Sections */}
      <div className="p-6 space-y-4">
        {sections.map((section, index) => {
          const isGenerated = progress >= section.minProgress;
          const Icon = section.icon;

          return (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className={`
                border-l-4 pl-4 py-3 transition-all duration-500
                ${isGenerated ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`
                  p-2 rounded-lg
                  ${isGenerated ? 'bg-green-500' : 'bg-gray-300'}
                `}>
                  <Icon className={`w-4 h-4 ${isGenerated ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <h4 className={`
                  font-semibold text-sm
                  ${isGenerated ? 'text-green-700' : 'text-gray-500'}
                `}>
                  {section.name}
                </h4>
                {isGenerated && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}
              </div>

              {/* Skeleton Lines */}
              <div className="space-y-2 mt-3">
                {isGenerated ? (
                  // Show filled skeleton lines for generated sections
                  <>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                      className="h-2 bg-green-200 rounded"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '90%' }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="h-2 bg-green-200 rounded"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-2 bg-green-200 rounded"
                    />
                  </>
                ) : (
                  // Show placeholder skeleton lines for pending sections
                  <>
                    <div className="h-2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2 bg-gray-200 rounded animate-pulse" style={{ width: '90%' }} />
                    <div className="h-2 bg-gray-200 rounded animate-pulse" style={{ width: '75%' }} />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {progress < 100
            ? `Generating report structure... ${Math.round(progress)}% complete`
            : 'Report generation complete! Loading...'
          }
        </p>
      </div>
    </div>
  );
}
