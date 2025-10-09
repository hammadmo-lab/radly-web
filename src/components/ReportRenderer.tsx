"use client"

import { motion } from "framer-motion"
import { JobDoneResult } from "@/lib/types"

interface ReportRendererProps {
  report: JobDoneResult["report"]
  className?: string
}

export default function ReportRenderer({ report, className = "" }: ReportRendererProps) {
  if (!report) {
    return (
      <div className="max-w-3xl mx-auto bg-white shadow-md p-6 rounded-2xl">
        <p className="text-gray-500 text-center">No report data available</p>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.article
      className={`max-w-3xl mx-auto bg-white shadow-md p-6 rounded-2xl space-y-6 print:shadow-none print:rounded-none ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
    </motion.article>
  )
}
