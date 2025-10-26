'use client';

import { motion } from 'framer-motion';
import {
  FileSearch,
  Brain,
  Microscope,
  Sparkles,
  FileText,
  CheckCircle,
  LucideIcon
} from 'lucide-react';

interface GenerationStep {
  icon: LucideIcon;
  text: string;
  stage: string;
  minProgress: number;
  maxProgress: number;
}

const GENERATION_STEPS: GenerationStep[] = [
  {
    icon: FileSearch,
    text: "Analyzing patient demographics and clinical indication...",
    stage: "queued",
    minProgress: 0,
    maxProgress: 15
  },
  {
    icon: Brain,
    text: "Processing medical history and context...",
    stage: "running-early",
    minProgress: 15,
    maxProgress: 35
  },
  {
    icon: Microscope,
    text: "Interpreting imaging findings with AI assistance...",
    stage: "running-mid",
    minProgress: 35,
    maxProgress: 60
  },
  {
    icon: Sparkles,
    text: "Generating differential diagnosis and impressions...",
    stage: "running-late",
    minProgress: 60,
    maxProgress: 80
  },
  {
    icon: FileText,
    text: "Formatting professional medical report...",
    stage: "finalizing",
    minProgress: 80,
    maxProgress: 95
  },
  {
    icon: CheckCircle,
    text: "Quality checking terminology and structure...",
    stage: "done",
    minProgress: 95,
    maxProgress: 100
  }
];

interface GenerationStepsProps {
  currentProgress: number;
  jobStatus: 'queued' | 'running' | 'done' | 'error';
}

export function GenerationSteps({ currentProgress, jobStatus }: GenerationStepsProps) {
  // Determine current step based on progress
  const currentStepIndex = GENERATION_STEPS.findIndex(
    step => currentProgress >= step.minProgress && currentProgress < step.maxProgress
  ) || 0;

  // For done status, show all steps as complete
  const activeStepIndex = jobStatus === 'done' ? GENERATION_STEPS.length - 1 : currentStepIndex;

  return (
    <div className="space-y-3">
      {GENERATION_STEPS.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isCompleted = index < activeStepIndex || jobStatus === 'done';
        const Icon = step.icon;

        return (
          <motion.div
            key={step.stage}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`flex items-start gap-2 sm:gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.6)] px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300 ${isActive ? 'shadow-[0_18px_42px_rgba(31,64,175,0.35)] border-[rgba(75,142,255,0.35)]' : ''} ${isCompleted ? 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.16)]' : ''}`}
          >
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg text-white ${isActive ? 'bg-[linear-gradient(135deg,#2653FF,#4B8EFF)] animate-pulse' : isCompleted ? 'bg-[linear-gradient(135deg,#3FBF8C,#6EE7B7)]' : 'bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.6)]'}`}
            >
              {isActive ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              ) : (
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium leading-tight ${isActive || isCompleted ? 'text-white' : 'text-[rgba(207,207,207,0.55)]'}`}>
                {step.text}
              </p>
            </div>

            {isActive && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-[rgba(75,142,255,0.8)] animate-ping" />
              </motion.div>
            )}
            {isCompleted && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-[#7AE7B4]" />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
