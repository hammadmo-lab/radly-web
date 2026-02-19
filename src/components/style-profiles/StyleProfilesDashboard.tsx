"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Upload, FileText, MoreVertical, Star, Edit2, Trash2, AlertCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useStyleProfiles,
  useUpdateStyleProfile,
  useDeleteStyleProfile,
  useSetDefaultStyleProfile,
} from '@/hooks/use-style-profiles'
import { UploadStyleProfileDialog } from './UploadStyleProfileDialog'
import type { StyleProfile } from '@/types/style-profiles'

export function StyleProfilesDashboard() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StyleProfile | null>(null)
  const [renameTarget, setRenameTarget] = useState<StyleProfile | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const { data, isLoading, error, refetch } = useStyleProfiles()
  const updateMutation = useUpdateStyleProfile()
  const deleteMutation = useDeleteStyleProfile()
  const setDefaultMutation = useSetDefaultStyleProfile()

  const profiles = data?.profiles ?? []
  const count = data?.count ?? 0

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Error Loading Style Profiles
            </CardTitle>
            <CardDescription className="text-red-700">
              {(error as { message?: string }).message ?? 'Failed to load style profiles. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Empty ---
  if (count === 0) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">No Templates Uploaded Yet</CardTitle>
              <CardDescription className="text-base">
                Upload your hospital letterhead to export reports in your own branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setUploadOpen(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your First Template
                </Button>
              </div>
              {/* Step-by-step guide */}
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 text-sm">How to set up your template — step by step</h4>
                  <ol className="text-xs text-blue-800 space-y-2.5 list-none">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center text-xs">1</span>
                      <span>Open <strong>Microsoft Word</strong> (or Google Docs). Create your hospital letterhead exactly as you want it to look — add your logo, set your fonts, colours, header, footer, and page margins.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center text-xs">2</span>
                      <span>In the body of the document, type the special tags shown in the table below <strong>exactly as written</strong> — including the curly braces <code className="bg-blue-100 px-1 rounded font-mono">{'{}'}</code>. Radly will replace each tag with the real report content when you export.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center text-xs">3</span>
                      <span>Save the file in <strong>.docx format</strong> (Word document). If you used Google Docs, go to File → Download → Microsoft Word (.docx).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center text-xs">4</span>
                      <span>Click <strong>"Upload Your First Template"</strong> above. Your template will be active immediately — no waiting.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center text-xs">5</span>
                      <span>Click <strong>"Set as default"</strong> on the template card. From then on, every time you export a report as a Word file, Radly will use your letterhead automatically.</span>
                    </li>
                  </ol>
                </div>

                {/* Placeholder reference — scalar tags */}
                <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <h4 className="font-semibold text-violet-900 mb-1 text-sm">Simple tags — paste directly into any paragraph</h4>
                  <p className="text-xs text-violet-700 mb-3">Type each tag exactly as shown. Radly replaces it with the matching content when you export.</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-violet-900 uppercase tracking-wide">Required — your template must include these two</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pb-3 border-b border-violet-200">
                      {([
                        ['{findings}', 'Full findings text as a single block'],
                        ['{impression}', 'Full impression / conclusion as a single block'],
                      ] as const).map(([tag, desc]) => (
                        <div key={tag} className="flex items-start gap-2">
                          <code className="text-xs font-mono bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded flex-shrink-0">{tag}</code>
                          <span className="text-xs text-violet-700">{desc}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-violet-900 uppercase tracking-wide pt-1">Optional — include any or all of these</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                      {([
                        ['{exam_title}', 'Exam name / modality (e.g. Chest X-ray)'],
                        ['{patient_name}', 'Patient full name'],
                        ['{age_gender}', 'Age and sex (e.g. 45M, 32F)'],
                        ['{date}', 'Study / examination date'],
                        ['{mrn}', 'Medical record number'],
                        ['{clinical_history}', 'Clinical history / indication'],
                        ['{technique}', 'Imaging technique description'],
                        ['{recommendations}', 'Recommendations section'],
                        ['{reported_by}', 'Reporting radiologist name'],
                        ['{report_date}', 'Date the report was signed off'],
                      ] as const).map(([tag, desc]) => (
                        <div key={tag} className="flex items-start gap-2">
                          <code className="text-xs font-mono bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded flex-shrink-0 whitespace-nowrap">{tag}</code>
                          <span className="text-xs text-violet-700">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced formatting — loop tags */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-1 text-sm">Advanced layout options — for bullet lists and organ breakdowns</h4>
                  <p className="text-xs text-indigo-700 mb-3">
                    Instead of <code className="bg-indigo-100 px-1 rounded font-mono">{'{findings}'}</code>, you can use one of the special blocks below to get bullet points or an organ-by-organ layout.
                    Use <strong>either</strong> the plain tag <strong>or</strong> the block — not both. If you put both in the same template, the content will appear twice.
                  </p>

                  <div className="space-y-4">
                    {/* Bullet list */}
                    <div className="bg-white rounded-lg border border-indigo-200 p-3 space-y-2">
                      <p className="text-xs font-semibold text-indigo-900">Option 1 — Bullet or numbered list</p>
                      <p className="text-xs text-indigo-700">
                        Use this when you want each finding to appear as its own bullet point or numbered item, instead of one long paragraph.
                      </p>
                      <p className="text-xs font-medium text-indigo-800 mt-1">Replace <code className="bg-indigo-100 px-1 rounded font-mono">{'{findings}'}</code> with these three lines:</p>
                      <pre className="text-xs font-mono bg-gray-800 border border-gray-700 rounded p-2 text-gray-100 whitespace-pre leading-relaxed">
{`{#findings_list}
{.}
{/findings_list}`}
                      </pre>
                      <p className="text-xs text-indigo-700">
                        In Word, click on the <code className="bg-indigo-100 px-1 rounded font-mono">{'{.}'}</code> line and apply the <strong>List Bullet</strong> or <strong>List Number</strong> paragraph style. Radly will give each finding its own bullet or number automatically.
                      </p>
                      <p className="text-xs text-indigo-600 italic">
                        For impression, replace <code className="bg-indigo-100 px-1 rounded font-mono">{'{impression}'}</code> with <code className="bg-indigo-100 px-1 rounded font-mono">{'{#impression_list}'}</code> … <code className="bg-indigo-100 px-1 rounded font-mono">{'{/impression_list}'}</code> in the same way.
                      </p>
                    </div>

                    {/* Organ sections */}
                    <div className="bg-white rounded-lg border border-indigo-200 p-3 space-y-2">
                      <p className="text-xs font-semibold text-indigo-900">Option 2 — Organ-by-organ layout with bold headings</p>
                      <p className="text-xs text-indigo-700">
                        Use this when your reports follow the pattern "Organ name: description" (e.g. Liver, Spleen, Kidneys). Each organ gets its own line with the organ name in bold.
                      </p>
                      <p className="text-xs font-medium text-indigo-800 mt-1">Replace <code className="bg-indigo-100 px-1 rounded font-mono">{'{findings}'}</code> with these three lines:</p>
                      <pre className="text-xs font-mono bg-gray-800 border border-gray-700 rounded p-2 text-gray-100 whitespace-pre leading-relaxed">
{`{#findings_sections}
{organ}: {description}
{/findings_sections}`}
                      </pre>
                      <p className="text-xs text-indigo-700">
                        In Word, select only <code className="bg-indigo-100 px-1 rounded font-mono">{'{organ}:'}</code> on the middle line and apply <strong>Bold</strong>. Leave <code className="bg-indigo-100 px-1 rounded font-mono">{'{description}'}</code> as normal. The exported report will look like this:
                      </p>
                      <div className="bg-gray-800 border border-gray-700 rounded p-2 space-y-0.5">
                        <p className="text-xs text-gray-100"><strong>Liver:</strong> Normal size and echogenicity. No focal lesion.</p>
                        <p className="text-xs text-gray-100"><strong>Spleen:</strong> Normal size and enhancement pattern.</p>
                        <p className="text-xs text-gray-100"><strong>Pancreas:</strong> No focal mass. Duct not dilated.</p>
                      </div>
                      <p className="text-xs text-indigo-600 italic">
                        For impression, use <code className="bg-indigo-100 px-1 rounded font-mono">{'{#impression_sections}'}</code> and <code className="bg-indigo-100 px-1 rounded font-mono">{'{/impression_sections}'}</code>.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  You can upload up to 10 templates and switch between them at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <UploadStyleProfileDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onSuccess={() => refetch()}
        />
      </>
    )
  }

  // --- List ---
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Branded Templates</h2>
            <p className="text-gray-600 mt-1">
              Manage your DOCX letterhead templates ({count} / 10)
            </p>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            disabled={count >= 10}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Template
          </Button>
        </div>

        {/* Limit warning */}
        {count >= 10 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">Profile Limit Reached</p>
              <p className="text-xs text-amber-700 mt-1">
                You&apos;ve reached the maximum of 10 templates. Delete one to upload a new template.
              </p>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-2 hover:border-violet-500 transition-all hover:shadow-lg group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {profile.is_default && (
                            <Badge className="bg-violet-100 text-violet-700 text-xs">
                              <Star className="w-3 h-3 mr-1 fill-violet-700" />
                              Default
                            </Badge>
                          )}
                          <Badge
                            className={
                              profile.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 text-xs'
                                : 'bg-red-100 text-red-700 text-xs'
                            }
                          >
                            {profile.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-base truncate">{profile.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Updated: {formatDate(profile.updated_at)}
                        </CardDescription>

                        {/* Placeholder tags */}
                        {profile.found_placeholders.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {profile.found_placeholders.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs font-mono text-violet-700 border-violet-200 py-0"
                              >
                                {`{${tag}}`}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!profile.is_default && (
                            <DropdownMenuItem
                              onClick={() => setDefaultMutation.mutate(profile.id)}
                              disabled={setDefaultMutation.isPending}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Set as default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameTarget(profile)
                              setRenameValue(profile.name)
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteTarget(profile)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload dialog */}
      <UploadStyleProfileDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={() => refetch()}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Template
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget?.is_default && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                This is your default template. Deleting it will revert to the system default on export.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deleteTarget) return
                await deleteMutation.mutateAsync(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => { if (!open) setRenameTarget(null) }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Rename Template
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Template name"
              className="border-2 focus:border-violet-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (renameTarget && renameValue.trim()) {
                    updateMutation.mutate(
                      { id: renameTarget.id, updates: { name: renameValue.trim() } },
                      { onSuccess: () => setRenameTarget(null) }
                    )
                  }
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!renameValue.trim() || updateMutation.isPending}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              onClick={() => {
                if (!renameTarget || !renameValue.trim()) return
                updateMutation.mutate(
                  { id: renameTarget.id, updates: { name: renameValue.trim() } },
                  { onSuccess: () => setRenameTarget(null) }
                )
              }}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
