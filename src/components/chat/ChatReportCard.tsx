'use client'

// Report card component for the report_card UI hint
// Displays structured findings/impression with action buttons

import { useChatClient } from '@/hooks/useChatClient'
import {
    FileDown,
    Pencil,
    Users,
    Stethoscope,
    Siren,
    Scissors,
    Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatReportCardProps {
    report: {
        title: string
        findings: string
        impression: string
        recommendations?: string | null
    }
    docxUrl?: string
}

const REPORT_ACTIONS = [
    { label: 'Edit', value: 'edit', icon: Pencil },
    { label: 'Second Reader', value: 'second_reader', icon: Users },
    { label: 'Tumor Board', value: 'tumor_board', icon: Stethoscope },
    { label: 'Handoff ER', value: 'handoff_er', icon: Siren },
    { label: 'Handoff Surgery', value: 'handoff_surgery', icon: Scissors },
    { label: 'Handoff Oncology', value: 'handoff_oncology', icon: Activity },
] as const

export function ChatReportCard({ report, docxUrl }: ChatReportCardProps) {
    const { sendText } = useChatClient()

    return (
        <div className="mt-3 rounded-xl border border-[var(--ds-primary)]/20 bg-white/3 overflow-hidden">
            {/* Title bar */}
            <div className="px-4 py-2.5 border-b border-white/10 bg-[var(--ds-primary)]/5">
                <h4 className="text-sm font-semibold text-[var(--ds-primary)] uppercase tracking-wide">
                    {report.title}
                </h4>
            </div>

            {/* Report body */}
            <div className="px-4 py-3 space-y-3">
                {/* Findings */}
                <div>
                    <p className="text-xs font-semibold text-[var(--ds-text-tertiary)] uppercase tracking-wider mb-1">
                        Findings
                    </p>
                    <p className="text-sm text-[var(--ds-text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {report.findings}
                    </p>
                </div>

                {/* Impression */}
                <div>
                    <p className="text-xs font-semibold text-[var(--ds-text-tertiary)] uppercase tracking-wider mb-1">
                        Impression
                    </p>
                    <p className="text-sm text-[var(--ds-text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {report.impression}
                    </p>
                </div>

                {/* Recommendations (if present) */}
                {report.recommendations && (
                    <div>
                        <p className="text-xs font-semibold text-[var(--ds-text-tertiary)] uppercase tracking-wider mb-1">
                            Recommendations
                        </p>
                        <p className="text-sm text-[var(--ds-text-secondary)] whitespace-pre-wrap leading-relaxed">
                            {report.recommendations}
                        </p>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="px-4 py-3 border-t border-white/10 flex flex-wrap gap-2">
                {/* Export DOCX */}
                {docxUrl && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5 rounded-lg border-[var(--ds-primary)]/30 text-[var(--ds-primary)] hover:bg-[var(--ds-primary)]/10"
                        onClick={() => window.open(docxUrl, '_blank')}
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        Export DOCX
                    </Button>
                )}

                {REPORT_ACTIONS.map(({ label, value, icon: Icon }) => (
                    <Button
                        key={value}
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5 rounded-lg border-white/15 text-[var(--ds-text-secondary)] hover:bg-white/5 hover:text-[var(--ds-text-primary)]"
                        onClick={() => sendText(value)}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    )
}
