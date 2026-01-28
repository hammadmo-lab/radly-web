"use client"

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateApiKey } from '@/hooks/useAdminData'
import { CreateApiKeyRequest, ApiKeyScope, CreateApiKeyResponse } from '@/types/api-keys'
import { KeyRevealModal } from './KeyRevealModal'

interface CreateApiKeyDialogProps {
    isOpen: boolean
    onClose: () => void
    /** Pre-selected user (optional, for convenience) */
    preselectedUserId?: string
    preselectedUserEmail?: string
}

const AVAILABLE_SCOPES: { value: ApiKeyScope; label: string; description: string }[] = [
    { value: 'chatbot', label: 'Chatbot', description: 'Access to chatbot API endpoints' },
    { value: 'generate', label: 'Generate', description: 'Access to report generation' },
    { value: 'export', label: 'Export', description: 'Access to export functionality' },
]

export function CreateApiKeyDialog({
    isOpen,
    onClose,
    preselectedUserId,
    preselectedUserEmail,
}: CreateApiKeyDialogProps) {
    const [userId, setUserId] = useState(preselectedUserId || '')
    const [userEmail, setUserEmail] = useState(preselectedUserEmail || '')
    const [name, setName] = useState('')
    const [scopes, setScopes] = useState<ApiKeyScope[]>([])
    const [rateLimit, setRateLimit] = useState(200)
    const [expiresAt, setExpiresAt] = useState('')

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Created key for reveal modal
    const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null)
    const [showKeyReveal, setShowKeyReveal] = useState(false)

    const createApiKey = useCreateApiKey()

    // Reset form when dialog opens
    useEffect(() => {
        if (isOpen) {
            setUserId(preselectedUserId || '')
            setUserEmail(preselectedUserEmail || '')
            setName('')
            setScopes([])
            setRateLimit(200)
            setExpiresAt('')
            setErrors({})
        }
    }, [isOpen, preselectedUserId, preselectedUserEmail])

    const toggleScope = (scope: ApiKeyScope) => {
        setScopes((prev) =>
            prev.includes(scope)
                ? prev.filter((s) => s !== scope)
                : [...prev, scope]
        )
        // Clear scope error when user selects a scope
        if (!scopes.includes(scope)) {
            setErrors((prev) => ({ ...prev, scopes: '' }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!userId.trim()) {
            newErrors.userId = 'User ID is required'
        }

        if (!name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (scopes.length === 0) {
            newErrors.scopes = 'At least one scope is required'
        }

        if (rateLimit < 1 || rateLimit > 10000) {
            newErrors.rateLimit = 'Rate limit must be between 1 and 10000'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        const data: CreateApiKeyRequest = {
            user_id: userId.trim(),
            name: name.trim(),
            scopes,
            rate_limit: rateLimit,
            expires_at: expiresAt || null,
        }

        try {
            const response = await createApiKey.mutateAsync(data)
            setCreatedKey(response)
            setShowKeyReveal(true)
        } catch (error) {
            // Error is handled in the mutation hook
            console.error('Create API key error:', error)
        }
    }

    const handleKeyRevealClose = () => {
        setShowKeyReveal(false)
        setCreatedKey(null)
        onClose()
    }

    const handleClose = () => {
        setErrors({})
        onClose()
    }

    return (
        <>
            <Dialog open={isOpen && !showKeyReveal} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                            Create a new API key for programmatic access. The key will only be shown once after creation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* User ID */}
                        <div className="space-y-2">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                value={userId}
                                onChange={(e) => {
                                    setUserId(e.target.value)
                                    setErrors((prev) => ({ ...prev, userId: '' }))
                                }}
                                placeholder="Enter user UUID"
                                className={errors.userId ? 'border-destructive' : ''}
                                disabled={createApiKey.isPending}
                            />
                            {userEmail && (
                                <p className="text-xs text-muted-foreground">
                                    Email: {userEmail}
                                </p>
                            )}
                            {errors.userId && (
                                <p className="text-xs text-destructive">{errors.userId}</p>
                            )}
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Key Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    setErrors((prev) => ({ ...prev, name: '' }))
                                }}
                                placeholder="e.g., Production Chatbot"
                                className={errors.name ? 'border-destructive' : ''}
                                disabled={createApiKey.isPending}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name}</p>
                            )}
                        </div>

                        {/* Scopes */}
                        <div className="space-y-2">
                            <Label>Scopes</Label>
                            <div className="space-y-3 rounded-lg border p-3">
                                {AVAILABLE_SCOPES.map((scope) => (
                                    <div key={scope.value} className="flex items-start gap-3">
                                        <Checkbox
                                            id={`scope-${scope.value}`}
                                            checked={scopes.includes(scope.value)}
                                            onCheckedChange={() => toggleScope(scope.value)}
                                            disabled={createApiKey.isPending}
                                        />
                                        <div className="space-y-1">
                                            <label
                                                htmlFor={`scope-${scope.value}`}
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                {scope.label}
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                {scope.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.scopes && (
                                <p className="text-xs text-destructive">{errors.scopes}</p>
                            )}
                        </div>

                        {/* Rate Limit */}
                        <div className="space-y-2">
                            <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
                            <Input
                                id="rateLimit"
                                type="number"
                                min={1}
                                max={10000}
                                value={rateLimit}
                                onChange={(e) => {
                                    setRateLimit(parseInt(e.target.value) || 200)
                                    setErrors((prev) => ({ ...prev, rateLimit: '' }))
                                }}
                                className={errors.rateLimit ? 'border-destructive' : ''}
                                disabled={createApiKey.isPending}
                            />
                            {errors.rateLimit && (
                                <p className="text-xs text-destructive">{errors.rateLimit}</p>
                            )}
                        </div>

                        {/* Expiration (optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="expiresAt">
                                Expiration Date <span className="text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                id="expiresAt"
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                disabled={createApiKey.isPending}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={createApiKey.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createApiKey.isPending}
                        >
                            {createApiKey.isPending ? 'Creating...' : 'Create Key'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Key Reveal Modal - shows after successful creation */}
            {createdKey && (
                <KeyRevealModal
                    isOpen={showKeyReveal}
                    onClose={handleKeyRevealClose}
                    apiKey={createdKey.key}
                    keyName={createdKey.name}
                />
            )}
        </>
    )
}
