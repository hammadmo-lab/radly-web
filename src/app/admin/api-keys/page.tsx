"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Key,
    LogOut,
    Shield,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useApiKeys } from '@/hooks/useAdminData'
import {
    ApiKeysTable,
    CreateApiKeyDialog,
    EditApiKeyDialog,
    DeleteApiKeyDialog,
} from '@/components/admin/api-keys'
import { ApiKey } from '@/types/api-keys'
import { toast } from 'sonner'

export default function ApiKeysPage() {
    const router = useRouter()
    const { logout } = useAdminAuth()

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
    const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null)

    // Fetch API keys
    const {
        data: apiKeysData,
        isLoading,
        error,
        refetch
    } = useApiKeys()

    const handleRefresh = useCallback(() => {
        refetch()
        toast.success('Data refreshed')
    }, [refetch])

    const handleLogout = useCallback(() => {
        logout()
        router.push('/admin/login')
        toast.success('Logged out successfully')
    }, [logout, router])

    const handleCreateKey = useCallback(() => {
        setShowCreateDialog(true)
    }, [])

    const handleEditKey = useCallback((key: ApiKey) => {
        setEditingKey(key)
    }, [])

    const handleDeleteKey = useCallback((key: ApiKey) => {
        setDeletingKey(key)
    }, [])

    return (
        <AdminGuard>
            <AdminErrorBoundary>
                <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
                    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 neon-page-stack">
                        <div className="neon-shell space-y-8 p-6 sm:p-8 md:p-10 backdrop-blur-xl">

                            <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_55%,#8F82FF_100%)] shadow-[0_22px_48px_rgba(52,84,207,0.38)]">
                                            <Key className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
                                                Radly Control Room
                                            </p>
                                            <h1 className="text-3xl font-semibold text-white">API Keys</h1>
                                        </div>
                                    </div>
                                    <p className="max-w-xl text-sm text-[rgba(207,207,207,0.65)]">
                                        Manage API keys for programmatic access to Radly services.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/admin')}
                                        className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] px-5 text-[rgba(207,207,207,0.8)] hover:border-[rgba(75,142,255,0.35)] hover:text-white"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Dashboard
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] px-5 text-[rgba(207,207,207,0.8)] hover:border-[rgba(255,107,107,0.32)] hover:text-[#FFD1D1]"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Button>
                                </div>
                            </header>

                            {/* Error state */}
                            {error && (
                                <div className="rounded-2xl border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.12)] p-5 sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]">
                                                <AlertCircle className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold text-white">Error loading API keys</h2>
                                                <p className="text-sm text-[#FFD1D1]">
                                                    {error.message}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => refetch()}
                                            className="h-9 rounded-lg border border-[rgba(255,255,255,0.12)] px-4 text-[#FFD1D1] hover:border-[rgba(255,107,107,0.45)] hover:bg-[rgba(255,107,107,0.12)]"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* API Keys Table */}
                            <section>
                                <ApiKeysTable
                                    apiKeys={apiKeysData?.keys || []}
                                    isLoading={isLoading}
                                    onRefresh={handleRefresh}
                                    onCreateKey={handleCreateKey}
                                    onEditKey={handleEditKey}
                                    onDeleteKey={handleDeleteKey}
                                />
                            </section>
                        </div>
                    </div>
                </div>

                {/* Dialogs */}
                <CreateApiKeyDialog
                    isOpen={showCreateDialog}
                    onClose={() => setShowCreateDialog(false)}
                />

                <EditApiKeyDialog
                    isOpen={!!editingKey}
                    onClose={() => setEditingKey(null)}
                    apiKey={editingKey}
                />

                <DeleteApiKeyDialog
                    isOpen={!!deletingKey}
                    onClose={() => setDeletingKey(null)}
                    apiKey={deletingKey}
                />
            </AdminErrorBoundary>
        </AdminGuard>
    )
}
