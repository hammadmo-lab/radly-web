'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Brain, Sparkles, Zap, Heart } from 'lucide-react';

const MEDICAL_TRIVIA = [
  {
    icon: Brain,
    text: "The first CT scanner was invented in 1971 by Godfrey Hounsfield, revolutionizing medical imaging.",
    category: "History"
  },
  {
    icon: Sparkles,
    text: "MRI stands for Magnetic Resonance Imaging, using powerful magnets instead of radiation to create detailed images.",
    category: "Technology"
  },
  {
    icon: Lightbulb,
    text: "The average radiology report contains 200-500 words of technical observations and clinical impressions.",
    category: "Fun Fact"
  },
  {
    icon: Zap,
    text: "AI can now detect certain conditions like lung nodules with 95%+ accuracy, assisting radiologists worldwide.",
    category: "AI"
  },
  {
    icon: Heart,
    text: "Modern PACS systems can store millions of medical images and retrieve them in seconds for comparison.",
    category: "Technology"
  },
  {
    icon: Brain,
    text: "X-rays were discovered accidentally by Wilhelm Röntgen in 1895 while experimenting with cathode rays.",
    category: "History"
  },
  {
    icon: Sparkles,
    text: "A single CT scan can generate over 1000 individual image slices, providing incredible detail.",
    category: "Technology"
  },
  {
    icon: Lightbulb,
    text: "Radiologists interpret an average of 20,000-30,000 images per day in busy medical centers.",
    category: "Fun Fact"
  },
  {
    icon: Zap,
    text: "The first MRI scan of a human body took nearly 5 hours. Today, most scans complete in under 30 minutes.",
    category: "Technology"
  },
  {
    icon: Heart,
    text: "Medical imaging has evolved from simple X-rays to 3D reconstructions and even 4D real-time imaging.",
    category: "Progress"
  },
  {
    icon: Brain,
    text: "Ultrasound imaging is completely radiation-free, making it safe for pregnant women and children.",
    category: "Safety"
  },
  {
    icon: Sparkles,
    text: "PET scans can detect cancer by measuring metabolic activity, often before structural changes are visible.",
    category: "Technology"
  },
  {
    icon: Lightbulb,
    text: "The human body contains enough iron to make a small nail, which is why MRI machines need careful screening.",
    category: "Fun Fact"
  },
  {
    icon: Zap,
    text: "AI-powered reporting can reduce report turnaround time from hours to minutes while maintaining quality.",
    category: "AI"
  },
  {
    icon: Heart,
    text: "Contrast agents help highlight blood vessels and organs, making abnormalities easier to detect.",
    category: "Technology"
  }
];

interface MedicalTriviaProps {
  rotationInterval?: number; // in milliseconds
}

export function MedicalTrivia({ rotationInterval = 4000 }: MedicalTriviaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MEDICAL_TRIVIA.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [rotationInterval]);

  const currentTrivia = MEDICAL_TRIVIA[currentIndex];
  const Icon = currentTrivia.icon;

  return (
    <div className="relative min-h-[120px] flex items-center justify-center w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div className="aurora-card border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.72)] p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2653FF,#8F82FF)] text-white shadow-[0_16px_36px_rgba(31,64,175,0.4)]">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <span className="inline-block rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.6)]">
                  {currentTrivia.category}
                </span>
                <p className="text-xs sm:text-sm leading-relaxed text-[rgba(207,207,207,0.75)] break-words">
                  {currentTrivia.text}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-2 overflow-x-auto scrollbar-hide">
              {MEDICAL_TRIVIA.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-[rgba(75,142,255,0.7)]'
                      : 'w-2 bg-[rgba(207,207,207,0.25)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
