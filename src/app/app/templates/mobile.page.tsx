'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  X,
  BookTemplate,
  Activity,
  Menu,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { httpGet } from '@/lib/http'
import { fetchTemplates } from '@/lib/templates'
import { useAuth } from '@/components/auth-provider'
import { useSubscription } from '@/hooks/useSubscription'

export default function MobileTemplatesPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { data: subscriptionData } = useSubscription()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModality, setSelectedModality] = useState<string>('')
  const [selectedAnatomy, setSelectedAnatomy] = useState<string>('')
  const [showModalityDropdown, setShowModalityDropdown] = useState(false)
  const [showAnatomyDropdown, setShowAnatomyDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => await fetchTemplates(httpGet),
  })

  // Get unique modalities
  const modalities = useMemo(() => {
    if (!templates) return []
    const modalitySet = new Set<string>()
    templates.forEach(template => {
      if (template.modality) modalitySet.add(template.modality)
    })
    return Array.from(modalitySet).sort()
  }, [templates])

  // Get anatomies for selected modality
  const anatomies = useMemo(() => {
    if (!templates || !selectedModality) return []
    const anatomySet = new Set<string>()
    templates.forEach(template => {
      if (template.modality === selectedModality && template.anatomy) {
        anatomySet.add(template.anatomy)
      }
    })
    return Array.from(anatomySet).sort()
  }, [templates, selectedModality])

  // Filter templates based on search query and selected filters
  const filteredTemplates = useMemo(() => {
    if (!templates) return []

    // Only show templates if user has searched or selected filters
    const hasSearchOrFilter = searchQuery.trim() || selectedModality || selectedAnatomy
    if (!hasSearchOrFilter) return []

    return templates.filter(template => {
      const searchMatch = !searchQuery.trim() ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.modality && template.modality.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (template.anatomy && template.anatomy.toLowerCase().includes(searchQuery.toLowerCase()))

      const modalityMatch = !selectedModality || template.modality === selectedModality
      const anatomyMatch = !selectedAnatomy || template.anatomy === selectedAnatomy

      return searchMatch && modalityMatch && anatomyMatch
    })
  }, [templates, searchQuery, selectedModality, selectedAnatomy])

  const handleSelectTemplate = (templateId: string, templateName: string) => {
    localStorage.setItem('recent-template-id', templateId)
    localStorage.setItem('recent-template-name', templateName)
    router.push(`/app/generate?templateId=${encodeURIComponent(templateId)}`)
  }

  const handleClearAll = () => {
    setSearchQuery('')
    setSelectedModality('')
    setSelectedAnatomy('')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
        {/* Safe Area Spacer for Notch */}
        <div className="h-16 bg-[#0a0e1a]" />

        {/* Header - Matches dashboard exactly */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-50 bg-gradient-to-b from-[#0a0e1a] to-transparent px-4 pb-4 pt-4 flex items-center justify-between border-b border-white/10"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
            >
              <Menu className="w-6 h-6 text-white/80" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Templates</h1>
              <p className="text-sm text-white/60">Loading templates...</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/app/settings')}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          >
            <Settings className="w-6 h-6 text-white/80" />
          </button>
        </motion.div>

        {/* Loading skeletons */}
        <div className="px-4 py-6 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 bg-[rgba(255,255,255,0.05)] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      {/* Safe Area Spacer for Notch - Matches dashboard */}
      <div className="h-16 bg-[#0a0e1a]" />

      {/* Header - Matches dashboard exactly */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-50 bg-gradient-to-b from-[#0a0e1a] to-transparent px-4 pb-4 pt-4 flex items-center justify-between border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          >
            <Menu className="w-6 h-6 text-white/80" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Templates</h1>
            <p className="text-sm text-white/60">
              {filteredTemplates.length > 0
                ? `${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''} found`
                : 'Search or select filters to find templates'
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/app/settings')}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        >
          <Settings className="w-6 h-6 text-white/80" />
        </button>
      </motion.div>

      {/* Search and Filters Section */}
      <div className="container px-4 py-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ds-text-muted)]" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[rgba(18,22,36,0.85)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[var(--ds-text-muted)] focus:outline-none focus:border-[var(--ds-primary)]/50 touch-manipulation"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-90 transition-transform"
            >
              <X className="w-4 h-4 text-[var(--ds-text-secondary)]" />
            </button>
          )}
        </div>

        {/* Modality Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowModalityDropdown(!showModalityDropdown)
              setShowAnatomyDropdown(false)
            }}
            className="w-full h-12 px-4 bg-[rgba(18,22,36,0.85)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white flex items-center justify-between touch-manipulation active:scale-[0.98] transition-transform"
          >
            <span className={selectedModality ? 'text-white' : 'text-[var(--ds-text-muted)]'}>
              {selectedModality || 'Select Modality'}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showModalityDropdown ? 'rotate-180' : ''} text-[var(--ds-text-secondary)]`} />
          </button>

          <AnimatePresence>
            {showModalityDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[rgba(12,12,14,0.98)] backdrop-blur-xl border border-[rgba(255,255,255,0.15)] rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto max-w-[calc(100vw-2rem)] mx-auto"
              >
                {modalities.map((modality) => (
                  <button
                    key={modality}
                    onClick={() => {
                      setSelectedModality(modality)
                      setSelectedAnatomy('') // Reset anatomy when modality changes
                      setShowModalityDropdown(false)
                      setShowAnatomyDropdown(false)
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.98] transition-all touch-manipulation"
                  >
                    {modality}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Anatomy Dropdown - Only enabled when modality is selected */}
        <div className="relative">
          <button
            onClick={() => {
              if (selectedModality) {
                setShowAnatomyDropdown(!showAnatomyDropdown)
                setShowModalityDropdown(false)
              }
            }}
            disabled={!selectedModality}
            className={`w-full h-12 px-4 rounded-xl flex items-center justify-between touch-manipulation active:scale-[0.98] transition-all ${
              selectedModality
                ? 'bg-[rgba(18,22,36,0.85)] border border-[rgba(255,255,255,0.08)] text-white'
                : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.03)] text-[var(--ds-text-muted)] opacity-50'
            }`}
          >
            <span className={selectedAnatomy ? 'text-white' : 'text-[var(--ds-text-muted)]'}>
              {selectedAnatomy || (selectedModality ? 'Select Anatomy/System' : 'Select modality first')}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showAnatomyDropdown ? 'rotate-180' : ''} text-[var(--ds-text-secondary)]`} />
          </button>

          <AnimatePresence>
            {showAnatomyDropdown && selectedModality && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[rgba(12,12,14,0.98)] backdrop-blur-xl border border-[rgba(255,255,255,0.15)] rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto max-w-[calc(100vw-2rem)] mx-auto"
              >
                {anatomies.map((anatomy) => (
                  <button
                    key={anatomy}
                    onClick={() => {
                      setSelectedAnatomy(anatomy)
                      setShowAnatomyDropdown(false)
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.98] transition-all touch-manipulation"
                  >
                    {anatomy}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear All Button */}
        {(searchQuery || selectedModality || selectedAnatomy) && (
          <button
            onClick={handleClearAll}
            className="w-full h-10 px-4 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-xl text-[var(--ds-text-secondary)] active:scale-[0.98] transition-transform touch-manipulation"
          >
            Clear all
          </button>
        )}

        {/* Instructions when no filters selected */}
        {!searchQuery && !selectedModality && !selectedAnatomy && (
          <div className="text-center py-12 px-4 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#4B8EFF]/20 to-[#8F82FF]/20 flex items-center justify-center border border-[#4B8EFF]/30">
              <Search className="w-8 h-8 text-[#4B8EFF]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Find your template</h3>
              <p className="text-sm text-white/60">
                Search by name or select imaging type to filter templates
              </p>
            </div>

            {/* Popular Searches */}
            <div className="space-y-3">
              <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Chest', 'CT Scan', 'MRI Brain', 'Ultrasound', 'X-ray'].map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/80 active:scale-95 transition-all touch-manipulation"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Helpful Tips */}
            <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-left max-w-xs mx-auto">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                💡 Pro Tips
              </p>
              <ul className="space-y-1 text-xs text-white/50">
                <li>• <span className="text-white/70">Modality</span> = Imaging type (CT, MRI, X-ray)</li>
                <li>• <span className="text-white/70">Anatomy</span> = Body part (Chest, Brain, Abdomen)</li>
                <li>• Try searching by body part or imaging type</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Templates List - Only show when there are search results */}
      {(searchQuery || selectedModality || selectedAnatomy) && (
        <div className="container px-4 pb-32">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                <FileText className="w-8 h-8 text-[var(--ds-text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
              <p className="text-sm text-[var(--ds-text-secondary)]">
                Try adjusting your search or filter selections
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectTemplate(template.id, template.title)}
                  className="w-full bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 active:scale-[0.98] transition-all touch-manipulation text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ds-primary)] to-[var(--ds-accent-purple)] flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white mb-1">
                        {template.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.modality && (
                          <span className="px-2 py-0.5 bg-[var(--ds-primary)]/20 border border-[var(--ds-primary)]/30 rounded-full text-[10px] font-medium text-[var(--ds-primary-alt)]">
                            {template.modality}
                          </span>
                        )}
                        {template.anatomy && (
                          <span className="px-2 py-0.5 bg-[var(--ds-accent-purple)]/20 border border-[var(--ds-accent-purple)]/30 rounded-full text-[10px] font-medium text-[var(--ds-accent-purple)]">
                            {template.anatomy}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--ds-text-muted)] shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Close dropdowns when clicking outside */}
      {(showModalityDropdown || showAnatomyDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowModalityDropdown(false)
            setShowAnatomyDropdown(false)
          }}
        />
      )}

      {/* Side Menu - Matches dashboard exactly */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-[rgba(10,14,26,0.98)] backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col"
              style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-white/10" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider">Radly</p>
                      <p className="text-base font-bold text-white">Templates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B8EFF] to-[#8F82FF] flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs text-white/50">
                      {subscriptionData?.subscription.tier_display_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                <a href="/app/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
                    <Activity className="w-5 h-5 text-white/60" />
                    <span className="text-base font-medium text-white/80">Dashboard</span>
                  </div>
                </a>
                <a href="/app/templates" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
                    <BookTemplate className="w-5 h-5 text-[#4B8EFF]" />
                    <span className="text-base font-medium text-white">Templates</span>
                  </div>
                </a>
                <a href="/app/reports" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
                    <FileText className="w-5 h-5 text-white/60" />
                    <span className="text-base font-medium text-white/80">Reports</span>
                  </div>
                </a>
                <a href="/app/settings" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
                    <Settings className="w-5 h-5 text-white/60" />
                    <span className="text-base font-medium text-white/80">Settings</span>
                  </div>
                </a>
              </div>

              {/* Sign Out Button */}
              <div className="p-4 border-t border-white/10" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 active:scale-95 transition-all min-h-[56px] touch-manipulation"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Matches dashboard exactly */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(10,14,26,0.95)] backdrop-blur-xl border-t border-white/10"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        <div className="flex items-center justify-around px-2 pt-3 pb-2">
          <a href="/app/dashboard" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Home</span>
          </a>
          <a href="/app/templates" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] flex items-center justify-center shadow-lg">
              <BookTemplate className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-white">Templates</span>
          </a>
          <a href="/app/reports" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Reports</span>
          </a>
        </div>
      </div>
    </div>
  )
}
