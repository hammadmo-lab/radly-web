"use client"

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Upload, FileText, CheckCircle } from 'lucide-react'
import { useUploadStyleProfile } from '@/hooks/use-style-profiles'
import { motion, AnimatePresence } from 'framer-motion'
import type { StyleProfile } from '@/types/style-profiles'

interface UploadStyleProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UploadStyleProfileDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadStyleProfileDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedProfile, setUploadedProfile] = useState<StyleProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useUploadStyleProfile()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    setError(null)
    setUploadedProfile(null)

    if (!selected) {
      setFile(null)
      return
    }

    if (!selected.name.toLowerCase().endsWith('.docx')) {
      setError('Only DOCX files are accepted')
      setFile(null)
      return
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10 MB')
      setFile(null)
      return
    }

    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a file'); return }
    if (!name.trim()) { setError('Please enter a profile name'); return }

    try {
      const profile = await uploadMutation.mutateAsync({ name: name.trim(), file, isDefault })
      setUploadedProfile(profile)

      // Reset form fields (keep dialog open to show success state)
      setFile(null)
      setName('')
      setIsDefault(false)
      if (fileInputRef.current) fileInputRef.current.value = ''

      onSuccess?.()
    } catch {
      // toast already shown by mutation onError
    }
  }

  const handleDone = () => {
    setUploadedProfile(null)
    setError(null)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setFile(null)
    setName('')
    setIsDefault(false)
    setError(null)
    setUploadedProfile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onOpenChange(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
  }

  // --- Success state ---
  if (uploadedProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              Template Active
            </DialogTitle>
            <DialogDescription>
              Your template is ready to use on every DOCX export.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm font-semibold text-emerald-900 mb-1">
                ✓ &ldquo;{uploadedProfile.name}&rdquo; is active and ready to use
              </p>
              <p className="text-xs text-emerald-700">
                {uploadedProfile.is_default
                  ? 'This template is set as your default — it will be applied automatically to every DOCX export.'
                  : 'To apply this template automatically to every export, open its menu and choose "Set as default".'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Sections detected in your template:</p>
              <p className="text-xs text-gray-500 mb-2">
                Radly found the following tags in your document. Each one will be replaced with the actual report content when you export.
              </p>
              {uploadedProfile.found_placeholders.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {uploadedProfile.found_placeholders.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-mono text-violet-700 border-violet-300">
                      {`{${tag}}`}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-xs text-amber-800">
                    No tags were detected in your template. Make sure your Word document contains{' '}
                    <code className="bg-amber-100 px-1 rounded font-mono">{'{findings}'}</code> and{' '}
                    <code className="bg-amber-100 px-1 rounded font-mono">{'{impression}'}</code> — typed exactly like that with the curly braces.
                    If you are unsure, please contact support.
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 italic mt-2">
                If you used bullet list or organ-by-organ layout blocks (<code className="bg-gray-100 px-0.5 rounded font-mono">{'{#findings_list}'}</code>, <code className="bg-gray-100 px-0.5 rounded font-mono">{'{#findings_sections}'}</code>, etc.), they will not appear in the list above — that is normal. Those layouts are always active and will work automatically on export.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleDone}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // --- Upload form ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            Upload Template
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1">
              <p>
                Upload your hospital or clinic&apos;s Word document (.docx) letterhead.
                Radly will keep your exact formatting — fonts, logo, headers, footers, margins —
                and fill in the report content automatically on every export.
              </p>
              <p className="text-amber-700 font-medium">
                Your document must contain <code className="bg-amber-100 px-1 rounded font-mono text-xs">{'{findings}'}</code> and{' '}
                <code className="bg-amber-100 px-1 rounded font-mono text-xs">{'{impression}'}</code> typed exactly like that (with the curly braces).
                These mark where the report sections will be inserted.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-5 py-4 pr-1">
          {/* File picker */}
          <div className="space-y-2">
            <Label htmlFor="sp-file-upload">DOCX Template</Label>
            <Input
              id="sp-file-upload"
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="cursor-pointer file:cursor-pointer file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-violet-500 file:text-white file:font-semibold hover:file:bg-violet-600"
            />
            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-200"
                >
                  <FileText className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-violet-900 truncate">{file.name}</p>
                    <p className="text-xs text-violet-700">{formatBytes(file.size)}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Maximum 10 MB · .docx only</p>
              {/* Tag reference */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-700">Tags to add inside your Word document:</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Required (your template must include both):</p>
                  <div className="grid grid-cols-1 gap-0.5">
                    {([
                      ['{findings}', 'Where the imaging findings paragraph goes'],
                      ['{impression}', 'Where the impression / conclusion goes'],
                    ] as const).map(([tag, desc]) => (
                      <div key={tag} className="flex items-start gap-2">
                        <code className="text-xs font-mono bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded flex-shrink-0">{tag}</code>
                        <span className="text-xs text-gray-600">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium pt-1">Optional (add any you want):</p>
                  <div className="grid grid-cols-1 gap-0.5">
                    {([
                      ['{exam_title}', 'Exam name (e.g. Chest X-ray, Brain MRI)'],
                      ['{patient_name}', 'Patient full name'],
                      ['{age_gender}', 'Age and sex — e.g. 45M or 32F'],
                      ['{date}', 'Study / examination date'],
                      ['{mrn}', 'Medical record number'],
                      ['{clinical_history}', 'Clinical history / reason for exam'],
                      ['{technique}', 'How the imaging was performed'],
                      ['{recommendations}', 'Follow-up recommendations'],
                      ['{reported_by}', 'Reporting radiologist name'],
                      ['{report_date}', 'Date the report was finalised'],
                    ] as const).map(([tag, desc]) => (
                      <div key={tag} className="flex items-start gap-2">
                        <code className="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded flex-shrink-0 whitespace-nowrap">{tag}</code>
                        <span className="text-xs text-gray-600">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                  <p className="text-xs text-gray-500 font-medium pt-1">For bullet lists or organ-by-organ layouts (optional):</p>
                  <p className="text-xs text-gray-500 mb-1">
                    Use <strong>either</strong> <code className="bg-gray-100 px-0.5 rounded font-mono">{'{findings}'}</code> <strong>or</strong> the loop block — not both. If you include both, the content will appear twice in the exported report.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-0.5">Bullet / numbered list — replace <code className="bg-gray-100 px-0.5 rounded font-mono">{'{findings}'}</code> with:</p>
                      <pre className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-100 px-2 py-1.5 rounded whitespace-pre-wrap leading-relaxed">{`{#findings_list}
{.}
{/findings_list}`}</pre>
                      <p className="text-xs text-gray-500 mt-0.5">Select the <code className="bg-gray-100 px-0.5 rounded">{'{.}'}</code> line in Word and apply the <strong>List Bullet</strong> style. Each finding becomes a separate bullet point.</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-0.5">Organ-by-organ layout — replace <code className="bg-gray-100 px-0.5 rounded font-mono">{'{findings}'}</code> with:</p>
                      <pre className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-100 px-2 py-1.5 rounded whitespace-pre-wrap leading-relaxed">{`{#findings_sections}
{organ}: {description}
{/findings_sections}`}</pre>
                      <p className="text-xs text-gray-500 mt-0.5">Bold <code className="bg-gray-100 px-0.5 rounded">{'{organ}:'}</code> in Word. Each organ appears on its own line — e.g. <em>Liver: normal size and echogenicity.</em></p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-0.5">Same options apply to impression — replace <code className="bg-gray-100 px-0.5 rounded font-mono">{'{impression}'}</code> with:</p>
                      <pre className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-100 px-2 py-1.5 rounded whitespace-pre-wrap leading-relaxed">{`{#impression_list}
{.}
{/impression_list}`}</pre>
                      <p className="text-xs text-gray-500 mt-0.5">Or use <code className="bg-gray-100 px-0.5 rounded font-mono">{'{#impression_sections}'}</code> … <code className="bg-gray-100 px-0.5 rounded font-mono">{'{/impression_sections}'}</code> for the organ breakdown variant.</p>
                    </div>
                  </div>
                <p className="text-xs text-gray-400 pt-1 mt-2">
                  Type each tag exactly as shown — include the curly braces <code className="bg-gray-100 px-0.5 rounded">{'{}'}</code> — then save your document and upload it here.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="sp-name">Template Name</Label>
            <Input
              id="sp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cairo University Letterhead"
              className="border-2 focus:border-violet-500"
            />
          </div>

          {/* Set as default */}
          <div className="flex items-center space-x-2">
            <input
              id="sp-is-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <Label htmlFor="sp-is-default" className="cursor-pointer text-sm font-normal">
              Set as default — apply automatically to every DOCX export
            </Label>
          </div>

          {/* Upload progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading…</span>
                <span className="font-medium text-violet-600">Processing</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-violet-600 h-2 rounded-full animate-pulse" style={{ width: '50%' }} />
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !name.trim() || uploadMutation.isPending}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {uploadMutation.isPending ? 'Uploading…' : (
              <><Upload className="w-4 h-4 mr-2" />Upload</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
