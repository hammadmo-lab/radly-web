'use client'

import { useState } from 'react'
import { useChatClient } from '@/hooks/useChatClient'
import { FileDown, Pencil, Users, Stethoscope, Siren, Scissors, Activity, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatReportCardProps {
    report: {
        title: string
        findings: string
        impression: string
        recommendations?: string | null
    }
    docxUrl?: string
}

const HANDOFF_ACTIONS = [
    { label: 'Second Reader',    value: 'second_reader',    icon: Users },
    { label: 'Tumor Board',      value: 'tumor_board',      icon: Stethoscope },
    { label: 'Handoff ER',       value: 'handoff_er',       icon: Siren },
    { label: 'Handoff Surgery',  value: 'handoff_surgery',  icon: Scissors },
    { label: 'Handoff Oncology', value: 'handoff_oncology', icon: Activity },
] as const

export function ChatReportCard({ report, docxUrl }: ChatReportCardProps) {
    const { sendText } = useChatClient()
    const [showHandoffs, setShowHandoffs] = useState(false)

    return (
        <div className="rounded-2xl border border-white/12 bg-[var(--ds-bg-primary)]/70 overflow-hidden shadow-xl">

            {/* ── Title bar ─────────────────────────────────────────── */}
            <div className="px-4 py-3 bg-gradient-to-r from-[var(--ds-primary)]/10 to-transparent border-b border-white/8">
                <h4 className="text-[11px] font-bold text-[var(--ds-primary)] uppercase tracking-widest">
                    {report.title}
                </h4>
            </div>

            {/* ── Report body ───────────────────────────────────────── */}
            <div className="px-4 py-3 space-y-3">
                <Section label="Findings" text={report.findings} />
                <Section label="Impression" text={report.impression} divider />
                {report.recommendations && (
                    <Section label="Recommendations" text={report.recommendations} divider />
                )}
            </div>

            {/* ── Primary actions ───────────────────────────────────── */}
            <div className="px-4 pb-3 flex gap-2">
                {docxUrl && (
                    <Button
                        size="sm"
                        className="flex-1 h-9 text-xs gap-1.5 rounded-xl bg-[var(--ds-primary)] text-black hover:opacity-90 font-semibold"
                        onClick={() => window.open(docxUrl, '_blank')}
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        Export DOCX
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                        'h-9 text-xs gap-1.5 rounded-xl border-white/15 text-[var(--ds-text-secondary)] hover:bg-white/5',
                        docxUrl ? 'flex-1' : 'w-full'
                    )}
                    onClick={() => sendText('edit')}
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </Button>
            </div>

            {/* ── Handoff / Consult section ─────────────────────────── */}
            <div className="border-t border-white/8">
                <button
                    onClick={() => setShowHandoffs(prev => !prev)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[var(--ds-text-muted)] hover:text-[var(--ds-text-secondary)] hover:bg-white/3 transition-colors"
                >
                    <span className="font-semibold uppercase tracking-widest">Handoff / Consult</span>
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', showHandoffs && 'rotate-180')} />
                </button>

                {showHandoffs && (
                    <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                        {HANDOFF_ACTIONS.map(({ label, value, icon: Icon }) => (
                            <Button
                                key={value}
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1.5 rounded-lg border-white/10 text-[var(--ds-text-tertiary)] hover:bg-white/5 hover:text-[var(--ds-text-primary)]"
                                onClick={() => sendText(value)}
                            >
                                <Icon className="h-3 w-3" />
                                {label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function Section({ label, text, divider }: { label: string; text: string; divider?: boolean }) {
    return (
        <div className={cn(divider && 'border-t border-white/5 pt-3')}>
            <p className="text-[10px] font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-1.5">
                {label}
            </p>
            <p className="text-sm text-[var(--ds-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {text}
            </p>
        </div>
    )
}
