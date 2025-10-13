'use client'
import { toast } from 'sonner'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Download,
  Share,
  Trash2,
  Edit,
  Copy
} from 'lucide-react'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastOptions {
  icon?: React.ReactNode
  action?: ToastAction
  duration?: number
  description?: string
}

// Enhanced toast notifications with distinct types and actions
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      icon: options?.icon,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick
      },
      duration: options?.duration || 4000,
      description: options?.description
    })
  },
  
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      icon: options?.icon,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick
      },
      duration: options?.duration || 6000, // Longer for errors
      description: options?.description
    })
  },
  
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      icon: options?.icon,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick
      },
      duration: options?.duration || 5000,
      description: options?.description
    })
  },
  
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      icon: options?.icon,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick
      },
      duration: options?.duration || 3000,
      description: options?.description
    })
  }
}

// Predefined toast messages for common actions
export const toastMessages = {
  // Report generation
  reportGenerationStarted: () => showToast.success(
    "Report generation started!",
    {
      description: "You'll be redirected to the report page shortly.",
      duration: 3000
    }
  ),
  
  reportGenerationCompleted: () => showToast.success(
    "Report generated successfully!",
    {
      description: "Your medical report is ready for review.",
      duration: 4000
    }
  ),
  
  reportGenerationFailed: (error?: string) => showToast.error(
    "Report generation failed",
    {
      description: error || "Please try again or contact support if the issue persists.",
      duration: 6000
    }
  ),

  // Template management
  templateCreated: (templateName: string) => showToast.success(
    `Template "${templateName}" created successfully`,
    {
      description: "You can now use this template to generate reports.",
      duration: 4000
    }
  ),
  
  templateUpdated: (templateName: string) => showToast.success(
    `Template "${templateName}" updated successfully`,
    {
      description: "Your changes have been saved.",
      duration: 3000
    }
  ),
  
  templateDeleted: (templateName: string, onUndo?: () => void) => showToast.success(
    `Template "${templateName}" deleted`,
    {
      description: "The template has been removed from your account.",
      action: onUndo ? {
        label: "Undo",
        onClick: onUndo
      } : undefined,
      duration: 5000
    }
  ),

  // Authentication
  signedIn: (email: string) => showToast.success(
    `Welcome back, ${email.split('@')[0]}!`,
    {
      description: "You're now signed in to Radly.",
      duration: 3000
    }
  ),
  
  signedOut: () => showToast.info(
    "Signed out successfully",
    {
      description: "You've been signed out of your account.",
      duration: 3000
    }
  ),
  
  sessionExpired: () => showToast.warning(
    "Session expired",
    {
      description: "Please sign in again to continue.",
      duration: 5000
    }
  ),

  // File operations
  reportExported: (format: string) => showToast.success(
    `Report exported as ${format.toUpperCase()}`,
    {
      description: "The file has been downloaded to your device.",
      duration: 4000
    }
  ),
  
  reportShared: () => showToast.success(
    "Report shared successfully",
    {
      description: "The report link has been copied to your clipboard.",
      duration: 3000
    }
  ),
  
  reportCopied: () => showToast.success(
    "Report copied to clipboard",
    {
      description: "You can now paste the report content elsewhere.",
      duration: 3000
    }
  ),

  // Settings
  settingsSaved: () => showToast.success(
    "Settings saved successfully",
    {
      description: "Your preferences have been updated.",
      duration: 3000
    }
  ),
  
  settingsReset: () => showToast.info(
    "Settings reset to defaults",
    {
      description: "All settings have been restored to their default values.",
      duration: 4000
    }
  ),

  // Form validation
  formValidationError: (field: string) => showToast.error(
    `Please check the ${field} field`,
    {
      description: "There's an issue with the information you entered.",
      duration: 4000
    }
  ),
  
  formSaved: () => showToast.success(
    "Form saved automatically",
    {
      description: "Your progress has been saved.",
      duration: 2000
    }
  ),

  // Network/API errors
  networkError: () => showToast.error(
    "Network error",
    {
      description: "Please check your internet connection and try again.",
      action: {
        label: "Retry",
        onClick: () => window.location.reload()
      },
      duration: 6000
    }
  ),
  
  serverError: () => showToast.error(
    "Server error",
    {
      description: "Something went wrong on our end. Please try again later.",
      duration: 6000
    }
  ),

  // Offline/Online status
  offlineMode: () => showToast.warning(
    "You're offline",
    {
      description: "Some features may not be available. Changes will sync when you're back online.",
      duration: 5000
    }
  ),
  
  backOnline: () => showToast.success(
    "You're back online",
    {
      description: "All features are now available.",
      duration: 3000
    }
  ),

  // Bulk operations
  bulkDeleteStarted: (count: number) => showToast.info(
    `Deleting ${count} items...`,
    {
      description: "This may take a moment.",
      duration: 2000
    }
  ),
  
  bulkDeleteCompleted: (count: number, onUndo?: () => void) => showToast.success(
    `${count} items deleted successfully`,
    {
      description: "The selected items have been removed.",
      action: onUndo ? {
        label: "Undo",
        onClick: onUndo
      } : undefined,
      duration: 5000
    }
  ),

  // Auto-save
  autoSaveEnabled: () => showToast.info(
    "Auto-save enabled",
    {
      description: "Your work will be saved automatically as you type.",
      duration: 3000
    }
  ),
  
  autoSaveDisabled: () => showToast.warning(
    "Auto-save disabled",
    {
      description: "Remember to save your work manually.",
      duration: 4000
    }
  )
}

// Utility function to show loading toast
export const showLoadingToast = (message: string, id?: string) => {
  return toast.loading(message, {
    id,
    duration: Infinity // Will be dismissed manually
  })
}

// Utility function to update loading toast
export const updateLoadingToast = (id: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  toast.dismiss(id)
  showToast[type](message)
}

// Utility function to dismiss specific toast
export const dismissToast = (id: string) => {
  toast.dismiss(id)
}

// Utility function to dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss()
}
