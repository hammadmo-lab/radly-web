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
    <div className="relative min-h-[120px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              {/* Animated Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex-shrink-0 p-3 bg-white rounded-xl shadow-md"
              >
                <Icon className="w-6 h-6 text-blue-600" />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                {/* Category Badge */}
                <div className="inline-block mb-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {currentTrivia.category}
                  </span>
                </div>

                {/* Trivia Text */}
                <p className="text-gray-700 leading-relaxed">
                  {currentTrivia.text}
                </p>
              </div>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {MEDICAL_TRIVIA.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-blue-600'
                      : 'w-1.5 bg-blue-300'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: index === currentIndex ? 1 : 0.8 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
