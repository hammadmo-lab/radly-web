'use client';

import { motion, type Variants, type Transition } from 'framer-motion';
import { JobDoneResult, PatientBlock } from '@/lib/types';
import { Signature } from '@/types/report';
import { ReportEditableSection } from '@/components/reports/ReportEditableSection';
import { EditStatusIndicator } from '@/components/reports/EditStatusIndicator';
import { FIELD_LIMITS } from '@/lib/report-edit';
import type { EditableField, SaveStatus } from '@/hooks/useReportEdit';

interface EditableReportRendererProps {
    report: JobDoneResult['report'];
    patient?: PatientBlock;
    signature?: Signature;
    className?: string;
    // Edit mode props
    isEditing?: boolean;
    editState?: {
        findings: string;
        impression: string;
        recommendations: string;
    };
    onFieldChange?: (field: EditableField, value: string) => void;
    saveStatus?: SaveStatus;
    lastSavedAt?: Date | null;
    error?: { message: string } | null;
    isOverLimit?: (field: EditableField) => boolean;
    isSaving?: boolean;
}

function PatientHeader({ patient }: { patient?: PatientBlock }) {
    if (!patient) return null;
    const hasAny = patient.name || patient.age !== undefined || patient.sex || patient.history || patient.mrn || patient.dob;
    if (!hasAny) return null;

    return (
        <motion.section
            className="rounded-xl border border-[var(--ds-border-medium)] p-4 mb-4 bg-[var(--ds-surface)]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
        >
            <h3 className="font-semibold mb-2 text-[var(--ds-text-primary)]">Patient</h3>
            <div className="grid gap-2 md:grid-cols-3 text-sm text-[var(--ds-text-secondary)]">
                {patient.name && <div><span className="text-[var(--ds-text-muted)]">Name:</span> {patient.name}</div>}
                {patient.age !== undefined && <div><span className="text-[var(--ds-text-muted)]">Age:</span> {patient.age}</div>}
                {patient.sex && <div><span className="text-[var(--ds-text-muted)]">Sex:</span> {patient.sex}</div>}
                {patient.mrn && <div><span className="text-[var(--ds-text-muted)]">MRN:</span> {patient.mrn}</div>}
                {patient.dob && <div><span className="text-[var(--ds-text-muted)]">DOB:</span> {patient.dob}</div>}
                {patient.history && <div className="md:col-span-3"><span className="text-[var(--ds-text-muted)]">History:</span> {patient.history}</div>}
            </div>
        </motion.section>
    );
}

/**
 * Report renderer with inline editing support
 * Extends the original ReportRenderer with editable sections
 */
export function EditableReportRenderer({
    report,
    patient,
    signature,
    className = '',
    isEditing = false,
    editState,
    onFieldChange,
    saveStatus = 'idle',
    lastSavedAt = null,
    error = null,
    isOverLimit = () => false,
    isSaving = false,
}: EditableReportRendererProps) {
    if (!report) {
        return (
            <div className="max-w-3xl mx-auto bg-[var(--ds-surface)] border border-[var(--ds-border-medium)] shadow-md p-6 rounded-2xl">
                <p className="text-[var(--ds-text-muted)] text-center">No report data available</p>
            </div>
        );
    }

    const easeBezier: Transition['ease'] = [0.25, 0.1, 0.25, 1];

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 8 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.28,
                ease: easeBezier,
                when: 'beforeChildren',
                staggerChildren: 0.06,
            } as Transition,
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 6 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.18, ease: easeBezier } as Transition,
        },
    };

    // Use edit state values if in edit mode, otherwise use original report
    const displayFindings = isEditing && editState ? editState.findings : report.findings;
    const displayImpression = isEditing && editState ? editState.impression : report.impression;
    const displayRecommendations = isEditing && editState ? editState.recommendations : report.recommendations;

    return (
        <motion.article
            className={`max-w-3xl mx-auto bg-[var(--ds-surface-elevated)] border border-[var(--ds-border-medium)] shadow-lg p-6 rounded-2xl space-y-6 print:shadow-none print:rounded-none print:bg-white print:text-black ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            role="article"
        >
            {/* Edit Status Indicator - only show when editing */}
            {isEditing && (
                <div className="flex justify-end -mb-2">
                    <EditStatusIndicator
                        status={saveStatus}
                        lastSavedAt={lastSavedAt}
                        error={error}
                    />
                </div>
            )}

            {/* Patient Header */}
            <PatientHeader patient={patient} />

            {/* Header - Title & Technique (read-only) */}
            <motion.header className="text-center" variants={itemVariants}>
                {report.title && (
                    <>
                        <h1 className="text-2xl font-bold text-[var(--ds-text-primary)] mb-2">
                            {report.title}
                        </h1>
                        <div className="bg-[var(--ds-primary)] h-0.5 w-24 mx-auto my-3 rounded" />
                    </>
                )}
                {report.technique && (
                    <p className="italic text-[var(--ds-text-secondary)] text-sm">
                        {report.technique}
                    </p>
                )}
            </motion.header>

            {/* Findings - Editable */}
            <motion.div variants={itemVariants}>
                {isEditing && onFieldChange ? (
                    <ReportEditableSection
                        label="Findings"
                        field="findings"
                        value={displayFindings || ''}
                        maxLength={FIELD_LIMITS.findings}
                        isEditable={true}
                        isOverLimit={isOverLimit('findings')}
                        onChange={onFieldChange}
                        isSaving={isSaving}
                        bgColorClass="bg-[rgba(255,255,255,0.04)]"
                        borderColorClass="border-[var(--ds-border-light)]"
                        minRows={6}
                    />
                ) : (
                    report.findings && (
                        <section>
                            <h2 className="text-lg font-semibold text-[var(--ds-text-primary)] mb-3">
                                Findings
                            </h2>
                            <div className="bg-[rgba(255,255,255,0.04)] border border-[var(--ds-border-light)] p-4 rounded-lg print:bg-transparent print:p-0 print:border-0">
                                <div className="whitespace-pre-wrap text-[var(--ds-text-secondary)] leading-relaxed">
                                    {report.findings}
                                </div>
                            </div>
                        </section>
                    )
                )}
            </motion.div>

            {/* Impression - Editable */}
            <motion.div variants={itemVariants}>
                {isEditing && onFieldChange ? (
                    <ReportEditableSection
                        label="Impression"
                        field="impression"
                        value={displayImpression || ''}
                        maxLength={FIELD_LIMITS.impression}
                        isEditable={true}
                        isOverLimit={isOverLimit('impression')}
                        onChange={onFieldChange}
                        isSaving={isSaving}
                        bgColorClass="bg-[rgba(58,130,247,0.08)]"
                        borderColorClass="border-[rgba(58,130,247,0.2)]"
                        minRows={4}
                    />
                ) : (
                    report.impression && (
                        <section>
                            <h2 className="text-lg font-semibold text-[var(--ds-text-primary)] mb-3">
                                Impression
                            </h2>
                            <div className="bg-[rgba(58,130,247,0.08)] border border-[rgba(58,130,247,0.2)] p-4 rounded-lg print:bg-transparent print:p-0 print:border-0">
                                <div className="whitespace-pre-wrap text-[var(--ds-text-primary)] font-medium leading-relaxed">
                                    {report.impression}
                                </div>
                            </div>
                        </section>
                    )
                )}
            </motion.div>

            {/* Recommendations - Editable */}
            <motion.div variants={itemVariants}>
                {isEditing && onFieldChange ? (
                    <ReportEditableSection
                        label="Recommendations"
                        field="recommendations"
                        value={displayRecommendations || ''}
                        maxLength={FIELD_LIMITS.recommendations}
                        isEditable={true}
                        isOverLimit={isOverLimit('recommendations')}
                        onChange={onFieldChange}
                        isSaving={isSaving}
                        bgColorClass="bg-[rgba(63,191,140,0.08)]"
                        borderColorClass="border-[rgba(63,191,140,0.2)]"
                        minRows={3}
                        labelSuffix="(optional)"
                    />
                ) : (
                    report.recommendations && (
                        <section>
                            <h2 className="text-lg font-semibold text-[var(--ds-text-primary)] mb-3">
                                Recommendations
                            </h2>
                            <div className="bg-[rgba(63,191,140,0.08)] border border-[rgba(63,191,140,0.2)] p-4 rounded-lg print:bg-transparent print:p-0 print:border-0">
                                <div className="whitespace-pre-wrap text-[var(--ds-text-secondary)] leading-relaxed">
                                    {report.recommendations}
                                </div>
                            </div>
                        </section>
                    )
                )}
            </motion.div>

            {/* Signature Section */}
            {signature && (signature.name || signature.date) && (
                <motion.section
                    className="mt-8 pt-6 border-t border-[var(--ds-border-medium)]"
                    variants={itemVariants}
                >
                    <div className="flex flex-col items-end space-y-2">
                        {signature.name && (
                            <p className="text-sm italic text-[var(--ds-text-secondary)]">
                                <span className="font-medium">Signed:</span> {signature.name}
                            </p>
                        )}
                        {signature.date && (
                            <p className="text-sm italic text-[var(--ds-text-secondary)]">
                                <span className="font-medium">Date:</span> {signature.date}
                            </p>
                        )}
                    </div>
                </motion.section>
            )}
        </motion.article>
    );
}
