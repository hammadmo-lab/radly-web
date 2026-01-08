'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  Stethoscope,
  Heart,
  Brain,
  Microscope,
  Activity,
  Pill,
  Syringe,
  Droplet
} from 'lucide-react';

const MEDICAL_ICONS = [
  { Icon: Stethoscope, delay: 0 },
  { Icon: Heart, delay: 0.5 },
  { Icon: Brain, delay: 1 },
  { Icon: Microscope, delay: 1.5 },
  { Icon: Activity, delay: 2 },
  { Icon: Pill, delay: 2.5 },
  { Icon: Syringe, delay: 3 },
  { Icon: Droplet, delay: 3.5 }
];

interface IconProps {
  startX: number;
  endX: number;
  size: number;
  duration: number;
}

export function FloatingMedicalIcons() {
  // Generate stable random values on mount
  const iconProps = useMemo<IconProps[]>(() => {
    return MEDICAL_ICONS.map(() => ({
      startX: Math.random() * 100,
      endX: 0, // Will be calculated below
      size: 24 + Math.random() * 24,
      duration: 15 + Math.random() * 10,
    })).map(props => ({
      ...props,
      endX: props.startX + (Math.random() * 40 - 20),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {MEDICAL_ICONS.map(({ Icon, delay }, index) => {
        const { startX, endX, size, duration } = iconProps[index];

        return (
          <motion.div
            key={index}
            className="absolute opacity-10"
            style={{
              left: `${startX}%`,
              top: '100%'
            }}
            initial={{ y: 0, x: 0, opacity: 0 }}
            animate={{
              y: [0, -window.innerHeight - 100],
              x: [0, (endX - startX) + '%'],
              opacity: [0, 0.15, 0.15, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Icon size={size} className="text-emerald-500" />
          </motion.div>
        );
      })}
    </div>
  );
}
