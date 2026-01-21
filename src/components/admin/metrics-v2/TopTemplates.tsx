/**
 * src/components/admin/metrics-v2/TopTemplates.tsx
 * Ranked list of most-used templates
 */
'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import type { TopTemplateItem } from '@/types/metrics-summary.types';

interface TopTemplatesProps {
    data: TopTemplateItem[];
}

/**
 * Format template ID to human-readable name
 * e.g., "ct_chest_with_contrast" -> "CT Chest with Contrast"
 */
function formatTemplateName(template: string): string {
    return template
        .split('_')
        .map((word) => {
            // Keep common abbreviations uppercase
            const upperAbbreviations = ['ct', 'mri', 'xray', 'x-ray', 'pet', 'us'];
            if (upperAbbreviations.includes(word.toLowerCase())) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

export function TopTemplates({ data }: TopTemplatesProps) {
    if (data.length === 0) {
        return (
            <div className="aurora-card flex h-full items-center justify-center border border-[rgba(255,255,255,0.08)] p-6">
                <p className="text-sm text-[rgba(207,207,207,0.55)]">No template data available</p>
            </div>
        );
    }

    const maxCount = Math.max(...data.map((t) => t.count));

    return (
        <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-[rgba(207,207,207,0.55)]">
                Top Templates (MTD)
            </h3>
            <div className="space-y-3">
                {data.map((item, index) => {
                    const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                        <div key={item.template} className="group">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded text-xs font-medium text-[rgba(207,207,207,0.55)]">
                                        {index + 1}.
                                    </span>
                                    <FileSpreadsheet className="h-4 w-4 text-[rgba(207,207,207,0.45)]" />
                                    <span className="text-[rgba(207,207,207,0.9)] group-hover:text-white transition-colors">
                                        {formatTemplateName(item.template)}
                                    </span>
                                </div>
                                <span className="font-medium text-white">{item.count}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-1.5 ml-7 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                                <div
                                    className="h-full rounded-full bg-[rgba(245,215,145,0.5)] transition-all duration-300"
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
