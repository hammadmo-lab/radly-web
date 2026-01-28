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
import { Switch } from '@/components/ui/switch'
import { useUpdateApiKey } from '@/hooks/useAdminData'
import { ApiKey, ApiKeyScope, UpdateApiKeyRequest } from '@/types/api-keys'

interface EditApiKeyDialogProps {
    isOpen: boolean
    onClose: () => void
    apiKey: ApiKey | null
}

const AVAILABLE_SCOPES: { value: ApiKeyScope; label: string; description: string }[] = [
    { value: 'chatbot', label: 'Chatbot', description: 'Access to chatbot API endpoints' },
    { value: 'generate', label: 'Generate', description: 'Access to report generation' },
    { value: 'export', label: 'Export', description: 'Access to export functionality' },
]

export function EditApiKeyDialog({ isOpen, onClose, apiKey }: EditApiKeyDialogProps) {
    const [name, setName] = useState('')
    const [scopes, setScopes] = useState<ApiKeyScope[]>([])
    const [rateLimit, setRateLimit] = useState(200)
    const [isActive, setIsActive] = useState(true)

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string>>({})

    const updateApiKey = useUpdateApiKey()

    // Populate form when dialog opens with existing key data
    useEffect(() => {
        if (isOpen && apiKey) {
            setName(apiKey.name)
            setScopes([...apiKey.scopes])
            setRateLimit(apiKey.rate_limit)
            setIsActive(apiKey.is_active)
            setErrors({})
        }
    }, [isOpen, apiKey])

    const toggleScope = (scope: ApiKeyScope) => {
        setScopes((prev) =>
            prev.includes(scope)
                ? prev.filter((s) => s !== scope)
                : [...prev, scope]
        )
        if (!scopes.includes(scope)) {
            setErrors((prev) => ({ ...prev, scopes: '' }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

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
        if (!validateForm() || !apiKey) return

        const data: UpdateApiKeyRequest = {
            name: name.trim(),
            scopes,
            rate_limit: rateLimit,
            is_active: isActive,
        }

        try {
            await updateApiKey.mutateAsync({ id: apiKey.id, data })
            onClose()
        } catch (error) {
            // Error is handled in the mutation hook
            console.error('Update API key error:', error)
        }
    }

    const handleClose = () => {
        setErrors({})
        onClose()
    }

    if (!apiKey) return null

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit API Key</DialogTitle>
                    <DialogDescription>
                        Update the settings for <strong>{apiKey.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Key info (read-only) */}
                    <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium">Key Prefix</p>
                        <code className="mt-1 block font-mono text-sm text-muted-foreground">
                            {apiKey.key_prefix}...
                        </code>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Key Name</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                setErrors((prev) => ({ ...prev, name: '' }))
                            }}
                            placeholder="e.g., Production Chatbot"
                            className={errors.name ? 'border-destructive' : ''}
                            disabled={updateApiKey.isPending}
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
                                        id={`edit-scope-${scope.value}`}
                                        checked={scopes.includes(scope.value)}
                                        onCheckedChange={() => toggleScope(scope.value)}
                                        disabled={updateApiKey.isPending}
                                    />
                                    <div className="space-y-1">
                                        <label
                                            htmlFor={`edit-scope-${scope.value}`}
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
                        <Label htmlFor="edit-rateLimit">Rate Limit (requests/minute)</Label>
                        <Input
                            id="edit-rateLimit"
                            type="number"
                            min={1}
                            max={10000}
                            value={rateLimit}
                            onChange={(e) => {
                                setRateLimit(parseInt(e.target.value) || 200)
                                setErrors((prev) => ({ ...prev, rateLimit: '' }))
                            }}
                            className={errors.rateLimit ? 'border-destructive' : ''}
                            disabled={updateApiKey.isPending}
                        />
                        {errors.rateLimit && (
                            <p className="text-xs text-destructive">{errors.rateLimit}</p>
                        )}
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-active">Active Status</Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive keys will be rejected immediately
                            </p>
                        </div>
                        <Switch
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            disabled={updateApiKey.isPending}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={updateApiKey.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateApiKey.isPending}
                    >
                        {updateApiKey.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
