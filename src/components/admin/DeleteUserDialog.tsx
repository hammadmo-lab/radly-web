"use client"

import { useState } from 'react'
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
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDeleteUser } from '@/hooks/useAdminData'

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userEmail?: string
}

export function DeleteUserDialog({ isOpen, onClose, userId, userEmail }: DeleteUserDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const deleteUser = useDeleteUser()

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      return
    }

    try {
      await deleteUser.mutateAsync(userId)
      onClose()
      setConfirmText('')
    } catch (error) {
      // Error is handled in the mutation
      console.error('Delete user error:', error)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  const isDeleteEnabled = confirmText === 'DELETE'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting this user will remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User account and authentication</li>
                <li>All subscriptions and payment history</li>
                <li>All generated reports</li>
                <li>All usage statistics</li>
                <li>All audit log entries</li>
              </ul>
            </AlertDescription>
          </Alert>

          {userEmail && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">User to delete:</p>
              <p className="text-sm text-muted-foreground font-mono mt-1">{userEmail}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">ID: {userId}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
              autoComplete="off"
              disabled={deleteUser.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isDeleteEnabled || deleteUser.isPending}
          >
            {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
