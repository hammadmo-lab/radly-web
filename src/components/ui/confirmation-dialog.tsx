/**
 * Confirmation Dialog Component
 *
 * A reusable confirmation dialog for destructive or important actions.
 * Replaces browser confirm() with a styled modal dialog.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 * const handleConfirm = async () => {
 *   await deleteReport(reportId)
 *   setOpen(false)
 * }
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)} variant="destructive">Delete</Button>
 *     <ConfirmationDialog
 *       open={open}
 *       onOpenChange={setOpen}
 *       title="Delete Report?"
 *       description="This action cannot be undone."
 *       confirmText="Delete"
 *       cancelText="Cancel"
 *       variant="destructive"
 *       onConfirm={handleConfirm}
 *     />
 *   </>
 * )
 * ```
 */

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Info } from "lucide-react"

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Dialog description/body text */
  description: string
  /** Confirmation button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Visual variant for emphasis */
  variant?: "default" | "destructive" | "warning"
  /** Callback when confirmed */
  onConfirm?: () => void | Promise<void>
  /** Callback when cancelled */
  onCancel?: () => void
  /** Show loading state on confirm button */
  isLoading?: boolean
  /** Disable the confirm button */
  disabled?: boolean
}

const ConfirmationDialog = React.forwardRef<HTMLDivElement, ConfirmationDialogProps>(
  (
    {
      open = false,
      onOpenChange,
      title,
      description,
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "default",
      onConfirm,
      onCancel,
      isLoading = false,
      disabled = false,
    },
    ref
  ) => {
    const [isConfirming, setIsConfirming] = React.useState(false)

    const handleConfirm = React.useCallback(async () => {
      setIsConfirming(true)
      try {
        await onConfirm?.()
      } finally {
        setIsConfirming(false)
        onOpenChange?.(false)
      }
    }, [onConfirm, onOpenChange])

    const handleCancel = React.useCallback(() => {
      onCancel?.()
      onOpenChange?.(false)
    }, [onCancel, onOpenChange])

    const getIconAndColors = () => {
      switch (variant) {
        case "destructive":
          return {
            Icon: AlertCircle,
            iconColor: "text-[#FF6B6B]",
            bgColor: "bg-[rgba(255,107,107,0.12)]",
            buttonVariant: "destructive" as const,
          }
        case "warning":
          return {
            Icon: AlertCircle,
            iconColor: "text-[#F8B74D]",
            bgColor: "bg-[rgba(248,183,77,0.12)]",
            buttonVariant: "outline" as const,
          }
        default:
          return {
            Icon: Info,
            iconColor: "text-[#4B8EFF]",
            bgColor: "bg-[rgba(75,142,255,0.12)]",
            buttonVariant: "default" as const,
          }
      }
    }

    const { Icon, iconColor, bgColor, buttonVariant } = getIconAndColors()

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={ref}
          className="aurora-card border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.95)] sm:max-w-[425px]"
        >
          <DialogHeader className="space-y-4">
            <div className={`flex items-center gap-4 p-4 rounded-lg ${bgColor} border border-[rgba(255,255,255,0.08)]`}>
              <Icon className={`h-6 w-6 flex-shrink-0 ${iconColor}`} />
              <DialogTitle className="text-white text-lg">{title}</DialogTitle>
            </div>
          </DialogHeader>

          <DialogDescription className="text-[rgba(207,207,207,0.75)] text-base leading-relaxed">
            {description}
          </DialogDescription>

          <DialogFooter className="gap-3 pt-4 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isConfirming || disabled}
              className="h-10 border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.85)] hover:bg-[rgba(255,255,255,0.08)]"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={buttonVariant}
              onClick={handleConfirm}
              disabled={isConfirming || disabled || isLoading}
              className="h-10 min-w-[100px]"
            >
              {isConfirming || isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  {confirmText}
                </>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

ConfirmationDialog.displayName = "ConfirmationDialog"

export { ConfirmationDialog }
