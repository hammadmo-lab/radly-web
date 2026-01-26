'use client';

import { motion } from 'framer-motion';

interface CharacterCounterProps {
    current: number;
    max: number;
    className?: string;
}

/**
 * Circular progress indicator for character count
 * Uses theme colors: success (green), warning (yellow), error (red)
 */
export function CharacterCounter({ current, max, className = '' }: CharacterCounterProps) {
    const percentage = Math.min((current / max) * 100, 100);

    // Determine color based on percentage
    const getColor = () => {
        if (percentage >= 100) return 'var(--error)'; // #FF6B6B
        if (percentage >= 80) return 'var(--warning)'; // #FFB347
        return 'var(--success)'; // #4ECDC4
    };

    const color = getColor();

    // SVG circle parameters
    const size = 32;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Format display text
    const formatCount = (n: number) => {
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
        return n.toString();
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Circular progress */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                    aria-hidden="true"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                </svg>
            </div>

            {/* Text display */}
            <span
                className="text-xs font-medium tabular-nums"
                style={{ color }}
                aria-label={`${current} of ${max} characters used`}
            >
                {formatCount(current)}/{formatCount(max)}
            </span>
        </div>
    );
}
