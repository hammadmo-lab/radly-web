'use client'

import { motion } from 'framer-motion'
import { FileText, User, Stethoscope, CheckCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepProgressProps {
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
}

export function StepProgress({ currentStep, onStepClick, className }: StepProgressProps) {
  const steps = [
    { id: 1, name: 'Template', icon: FileText },
    { id: 2, name: 'Patient Info', icon: User },
    { id: 3, name: 'Clinical Data', icon: Stethoscope },
    { id: 4, name: 'Review', icon: CheckCircle },
  ]

  const totalSteps = steps.length

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-2xl shadow-sm border-2 border-gray-200 dark:border-gray-800 p-6", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 hidden sm:block">
          <motion.div 
            className="h-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between w-full sm:justify-around gap-4 sm:gap-0">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id
            const isActive = currentStep === step.id
            const isAccessible = step.id <= currentStep

            return (
              <div 
                key={step.id} 
                className="relative flex flex-col items-center gap-2 z-10"
              >
                <button
                  onClick={() => isAccessible && onStepClick?.(step.id)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isActive || isCompleted
                      ? "bg-gradient-primary text-white shadow-lg shadow-primary/30"
                      : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-400",
                    isAccessible && "cursor-pointer hover:scale-110",
                    !isAccessible && "cursor-not-allowed opacity-50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </button>
                
                {/* Step label */}
                <span className={cn(
                  "text-xs sm:text-sm font-medium transition-colors text-center",
                  isActive || isCompleted 
                    ? "text-primary" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
