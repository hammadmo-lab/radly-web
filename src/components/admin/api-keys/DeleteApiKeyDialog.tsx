"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDeleteApiKey } from '@/hooks/useAdminData'
import { ApiKey } from '@/types/api-keys'

interface DeleteApiKeyDialogProps {
    isOpen: boolean
    onClose: () => void
    apiKey: ApiKey | null
}

export function DeleteApiKeyDialog({ isOpen, onClose, apiKey }: DeleteApiKeyDialogProps) {
    const deleteApiKey = useDeleteApiKey()

    const handleDelete = async () => {
        if (!apiKey) return

        try {
            await deleteApiKey.mutateAsync(apiKey.id)
            onClose()
        } catch (error) {
            // Error is handled in the mutation hook
            console.error('Delete API key error:', error)
        }
    }

    if (!apiKey) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Revoke API Key
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Warning:</strong> This key will stop working immediately.
                            Any applications using this key will lose access.
                        </AlertDescription>
                    </Alert>

                    <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium">Key to revoke:</p>
                        <p className="text-sm text-muted-foreground mt-1">{apiKey.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            {apiKey.key_prefix}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            User: {apiKey.user_email}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteApiKey.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteApiKey.isPending}
                    >
                        {deleteApiKey.isPending ? 'Revoking...' : 'Revoke Key'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
