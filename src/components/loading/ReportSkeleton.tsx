'use client';

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
    <div className="aurora-card border border-[rgba(255,255,255,0.08)] overflow-hidden w-full">
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">Report structure preview</span>
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[rgba(207,207,207,0.65)]">Sections assembling in real time.</p>
      </div>

      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 w-full overflow-hidden">
        {sections.map((section) => {
          const isGenerated = progress >= section.minProgress;
          const Icon = section.icon;

          return (
            <div
              key={section.name}
              className={`rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.7)] px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300 w-full ${isGenerated ? 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.15)] shadow-[0_12px_28px_rgba(63,191,140,0.25)]' : ''}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={`flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${isGenerated ? 'bg-[linear-gradient(135deg,#3FBF8C,#6EE7B7)] text-white' : 'bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.55)]'}`}>
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
                <h4 className={`text-xs sm:text-sm font-semibold truncate flex-1 ${isGenerated ? 'text-white' : 'text-[rgba(207,207,207,0.55)]'}`}>
                  {section.name}
                </h4>
                {isGenerated && (
                  <div className="ml-auto flex-shrink-0">
                    <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-[#7AE7B4]" />
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2 w-full overflow-hidden">
                {isGenerated ? (
                  <>
                    <div className="h-2 w-full rounded bg-[rgba(63,191,140,0.35)]" />
                    <div className="h-2 w-[90%] rounded bg-[rgba(63,191,140,0.3)]" />
                    <div className="h-2 w-[75%] rounded bg-[rgba(63,191,140,0.25)]" />
                  </>
                ) : (
                  <>
                    <div className="h-2 w-full rounded bg-[rgba(207,207,207,0.2)] animate-pulse" />
                    <div className="h-2 w-[90%] rounded bg-[rgba(207,207,207,0.2)] animate-pulse" />
                    <div className="h-2 w-[75%] rounded bg-[rgba(207,207,207,0.2)] animate-pulse" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-4 sm:px-6 py-2 sm:py-3 text-center text-[0.7rem] sm:text-xs text-[rgba(207,207,207,0.55)]">
        {progress < 100
          ? `Generating report structure… ${Math.round(progress)}% complete`
          : 'Report generation complete! Loading…'}
      </div>
    </div>
  );
}
