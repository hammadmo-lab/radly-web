"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Key,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Plus,
    Edit2,
    Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiKey, ApiKeyScope } from '@/types/api-keys'
import { useUpdateApiKey } from '@/hooks/useAdminData'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface ApiKeysTableProps {
    apiKeys: ApiKey[]
    isLoading: boolean
    onRefresh: () => void
    onCreateKey: () => void
    onEditKey: (key: ApiKey) => void
    onDeleteKey: (key: ApiKey) => void
}

// Scope badge color styles matching the design spec
const SCOPE_BADGE_STYLES: Record<ApiKeyScope, string> = {
    chatbot: 'border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]',
    generate: 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.18)] text-[#C8F3E2]',
    export: 'border-[rgba(143,130,255,0.35)] bg-[rgba(143,130,255,0.16)] text-[#E2DAFF]',
}

export function ApiKeysTable({
    apiKeys,
    isLoading,
    onRefresh,
    onCreateKey,
    onEditKey,
    onDeleteKey,
}: ApiKeysTableProps) {
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const updateApiKey = useUpdateApiKey()

    // Filter keys by search
    const filteredKeys = useMemo(() => {
        if (!searchValue.trim()) return apiKeys
        const search = searchValue.toLowerCase()
        return apiKeys.filter(
            (key) =>
                key.name.toLowerCase().includes(search) ||
                key.user_email.toLowerCase().includes(search) ||
                key.key_prefix.toLowerCase().includes(search)
        )
    }, [apiKeys, searchValue])

    // Paginate
    const totalPages = Math.max(1, Math.ceil(filteredKeys.length / pageSize))
    const paginatedKeys = filteredKeys.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    const startItem = filteredKeys.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
    const endItem = Math.min(currentPage * pageSize, filteredKeys.length)

    const handleToggleActive = async (key: ApiKey) => {
        await updateApiKey.mutateAsync({
            id: key.id,
            data: { is_active: !key.is_active },
        })
    }

    const formatRelativeDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never'
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
        } catch {
            return 'Unknown'
        }
    }

    const renderScopeBadges = (scopes: ApiKeyScope[]) => {
        return (
            <div className="flex flex-wrap gap-1.5">
                {scopes.map((scope) => (
                    <Badge
                        key={scope}
                        className={cn(
                            'border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] bg-transparent',
                            SCOPE_BADGE_STYLES[scope]
                        )}
                    >
                        {scope}
                    </Badge>
                ))}
            </div>
        )
    }

    return (
        <Card className="aurora-card border border-[rgba(255,255,255,0.08)] backdrop-blur-xl">
            <CardHeader className="space-y-6 border-b border-[rgba(255,255,255,0.06)] p-6 pb-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_55%,#8F82FF_100%)] shadow-[0_22px_48px_rgba(52,84,207,0.38)]">
                            <Key className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-white">API Keys</h2>
                            <p className="text-sm text-[rgba(207,207,207,0.65)]">
                                Manage API keys for programmatic access
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            className="h-10 border border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.85)] hover:border-[#4B8EFF]/40 hover:text-white"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button
                            size="sm"
                            onClick={onCreateKey}
                            className="h-10 rounded-xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_55%,#8F82FF_100%)] text-white shadow-[0_8px_24px_rgba(52,84,207,0.35)] hover:shadow-[0_12px_32px_rgba(52,84,207,0.45)]"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create API Key
                        </Button>
                    </div>
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgba(207,207,207,0.45)]" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="h-12 rounded-xl border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] pl-12 text-white placeholder:text-[rgba(207,207,207,0.45)] focus-visible:ring-[#4B8EFF]"
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <Skeleton className="h-4 w-[120px] rounded bg-[rgba(255,255,255,0.08)]" />
                                <Skeleton className="h-4 w-[180px] rounded bg-[rgba(255,255,255,0.08)]" />
                                <Skeleton className="h-4 w-[100px] rounded bg-[rgba(255,255,255,0.08)]" />
                                <Skeleton className="h-4 w-[80px] rounded bg-[rgba(255,255,255,0.08)]" />
                            </div>
                        ))}
                    </div>
                ) : filteredKeys.length === 0 ? (
                    <div className="aurora-card border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.65)] py-12 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]">
                            <Key className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                            {searchValue ? 'No keys match your search' : 'No API keys yet'}
                        </h3>
                        <p className="mt-2 text-sm text-[rgba(207,207,207,0.65)]">
                            {searchValue
                                ? 'Try adjusting your search query'
                                : 'Create your first API key to enable programmatic access'}
                        </p>
                        {!searchValue && (
                            <Button
                                onClick={onCreateKey}
                                className="mt-6 h-11 rounded-xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_55%,#8F82FF_100%)] px-6 text-white shadow-[0_8px_24px_rgba(52,84,207,0.35)]"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create API Key
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)]">
                            <Table>
                                <TableHeader className="bg-[rgba(12,16,28,0.72)]">
                                    <TableRow className="border-b border-[rgba(255,255,255,0.06)]">
                                        {['Key', 'Name', 'User', 'Scopes', 'Status', 'Created', 'Last Used', 'Actions'].map(
                                            (column) => (
                                                <TableHead
                                                    key={column}
                                                    className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]"
                                                >
                                                    {column}
                                                </TableHead>
                                            )
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedKeys.map((apiKey) => (
                                        <motion.tr
                                            key={apiKey.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="border-b border-[rgba(255,255,255,0.05)] bg-transparent last:border-none hover:bg-[rgba(75,142,255,0.08)]"
                                        >
                                            <TableCell className="px-4 py-4">
                                                <code className="font-mono text-sm text-[rgba(207,207,207,0.85)]">
                                                    {apiKey.key_prefix}...
                                                </code>
                                            </TableCell>

                                            <TableCell className="px-4 py-4 text-sm text-white">
                                                {apiKey.name}
                                            </TableCell>

                                            <TableCell className="px-4 py-4 text-sm text-[rgba(207,207,207,0.75)]">
                                                {apiKey.user_email}
                                            </TableCell>

                                            <TableCell className="px-4 py-4">
                                                {renderScopeBadges(apiKey.scopes)}
                                            </TableCell>

                                            <TableCell className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={apiKey.is_active}
                                                        onCheckedChange={() => handleToggleActive(apiKey)}
                                                        disabled={updateApiKey.isPending}
                                                        className={cn(
                                                            apiKey.is_active
                                                                ? 'bg-[#3FBF8C]'
                                                                : 'bg-[rgba(255,255,255,0.12)]'
                                                        )}
                                                    />
                                                    <span className={cn(
                                                        'text-xs font-medium',
                                                        apiKey.is_active
                                                            ? 'text-[#C8F3E2]'
                                                            : 'text-[rgba(207,207,207,0.55)]'
                                                    )}>
                                                        {apiKey.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-4 text-sm text-[rgba(207,207,207,0.65)]">
                                                {formatRelativeDate(apiKey.created_at)}
                                            </TableCell>

                                            <TableCell className="px-4 py-4 text-sm text-[rgba(207,207,207,0.65)]">
                                                {formatRelativeDate(apiKey.last_used_at)}
                                            </TableCell>

                                            <TableCell className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEditKey(apiKey)}
                                                        className="h-8 w-8 p-0 border border-transparent text-[rgba(207,207,207,0.65)] hover:border-[rgba(75,142,255,0.35)] hover:bg-[rgba(75,142,255,0.12)] hover:text-[#D7E3FF]"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDeleteKey(apiKey)}
                                                        className="h-8 w-8 p-0 border border-transparent text-[rgba(207,207,207,0.65)] hover:border-[rgba(255,107,107,0.35)] hover:bg-[rgba(255,107,107,0.12)] hover:text-[#FFD1D1]"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-3 text-sm text-[rgba(207,207,207,0.55)] sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                Showing {startItem}-{endItem} of {filteredKeys.length} keys
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-9 border border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.8)] disabled:border-transparent disabled:text-[rgba(207,207,207,0.3)]"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-9 border border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.8)] disabled:border-transparent disabled:text-[rgba(207,207,207,0.3)]"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
