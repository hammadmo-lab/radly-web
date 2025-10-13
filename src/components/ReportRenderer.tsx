"use client"

import { motion, type Variants, type Transition } from "framer-motion"
import { JobDoneResult, PatientBlock } from "@/lib/types"
import { Signature } from "@/types/report"

interface ReportRendererProps {
  report: JobDoneResult["report"]
  patient?: PatientBlock
  signature?: Signature
  className?: string
}

export function PatientHeader({ patient }: { patient?: PatientBlock }) {
  if (!patient) return null
  const hasAny = patient.name || patient.age !== undefined || patient.sex || patient.history || patient.mrn || patient.dob
  if (!hasAny) return null
  
  return (
    <motion.section 
      className="rounded-xl border p-4 mb-4 bg-white"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <h3 className="font-semibold mb-2 text-[#0D2240]">Patient</h3>
      <div className="grid gap-2 md:grid-cols-3 text-sm">
        {patient.name && <div><span className="text-muted-foreground">Name:</span> {patient.name}</div>}
        {patient.age !== undefined && <div><span className="text-muted-foreground">Age:</span> {patient.age}</div>}
        {patient.sex && <div><span className="text-muted-foreground">Sex:</span> {patient.sex}</div>}
        {patient.mrn && <div><span className="text-muted-foreground">MRN:</span> {patient.mrn}</div>}
        {patient.dob && <div><span className="text-muted-foreground">DOB:</span> {patient.dob}</div>}
        {patient.history && <div className="md:col-span-3"><span className="text-muted-foreground">History:</span> {patient.history}</div>}
      </div>
    </motion.section>
  )
}

export default function ReportRenderer({ report, patient, signature, className = "" }: ReportRendererProps) {
  if (!report) {
    return (
      <div className="max-w-3xl mx-auto bg-white shadow-md p-6 rounded-2xl">
        <p className="text-gray-500 text-center">No report data available</p>
      </div>
    )
  }

  const easeBezier: Transition['ease'] = [0.25, 0.1, 0.25, 1] // standard ease-in-out

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
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.18, ease: easeBezier } as Transition,
    },
  }

  return (
    <motion.article
      className={`max-w-3xl mx-auto bg-white shadow-md p-6 rounded-2xl space-y-6 print:shadow-none print:rounded-none ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="article"
    >
      {/* Patient Header */}
      <PatientHeader patient={patient} />

      {/* Header */}
      <motion.header className="text-center" variants={itemVariants}>
        {report.title && (
          <>
            <h1 className="text-2xl font-bold text-[#0D2240] mb-2">
              {report.title}
            </h1>
            <div className="bg-[#127C99] h-0.5 w-24 mx-auto my-3 rounded" />
          </>
        )}
        {report.technique && (
          <p className="italic text-gray-600 text-sm">
            {report.technique}
          </p>
        )}
      </motion.header>

      {/* Findings */}
      {report.findings && (
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-semibold text-[#0D2240] mb-3">
            Findings
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-0">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {report.findings}
            </div>
          </div>
        </motion.section>
      )}

      {/* Impression */}
      {report.impression && (
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-semibold text-[#0D2240] mb-3">
            Impression
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg print:bg-transparent print:p-0">
            <div className="whitespace-pre-wrap text-gray-900 font-medium leading-relaxed">
              {report.impression}
            </div>
          </div>
        </motion.section>
      )}

      {/* Recommendations */}
      {report.recommendations && (
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-semibold text-[#0D2240] mb-3">
            Recommendations
          </h2>
          <div className="bg-green-50 p-4 rounded-lg print:bg-transparent print:p-0">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {report.recommendations}
            </div>
          </div>
        </motion.section>
      )}

      {/* Signature Section */}
      {signature && (signature.name || signature.date) && (
        <motion.section
          className="mt-8 pt-6 border-t border-gray-200"
          variants={itemVariants}
        >
          <div className="flex flex-col items-end space-y-2">
            {signature.name && (
              <p className="text-sm italic text-gray-700">
                <span className="font-medium">Signed:</span> {signature.name}
              </p>
            )}
            {signature.date && (
              <p className="text-sm italic text-gray-700">
                <span className="font-medium">Date:</span> {signature.date}
              </p>
            )}
          </div>
        </motion.section>
      )}
    </motion.article>
  )
}
