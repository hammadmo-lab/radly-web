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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all duration-300
              ${isActive ? 'bg-emerald-50 border-2 border-emerald-300 shadow-md' : ''}
              ${isCompleted ? 'bg-green-50 border border-green-200' : ''}
              ${!isActive && !isCompleted ? 'bg-gray-50 border border-gray-200 opacity-60' : ''}
            `}
          >
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${isActive ? 'bg-emerald-500 animate-pulse' : ''}
              ${isCompleted ? 'bg-green-500' : ''}
              ${!isActive && !isCompleted ? 'bg-gray-300' : ''}
            `}>
              {isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
              )}
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className={`
                text-sm font-medium transition-colors
                ${isActive ? 'text-emerald-700' : ''}
                ${isCompleted ? 'text-green-700' : ''}
                ${!isActive && !isCompleted ? 'text-gray-500' : ''}
              `}>
                {step.text}
              </p>
            </div>

            {/* Status indicator */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              </motion.div>
            )}
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
