import { useEffect, useCallback } from 'react'
import { UseFormWatch, UseFormSetValue, FieldValues } from 'react-hook-form'

interface UseFormDraftOptions<T extends FieldValues> {
  key: string
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
  enabled?: boolean
}

/**
 * Auto-save form data to localStorage and restore on mount
 * Prevents data loss during browser crashes or accidental navigation
 */
export function useFormDraft<T extends FieldValues>({
  key,
  watch,
  setValue,
  enabled = true,
}: UseFormDraftOptions<T>) {
  const storageKey = `form-draft-${key}`

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (!enabled) return

    const subscription = watch((formData) => {
      try {
        // Only save if there's meaningful data
        const hasData = Object.values(formData).some((value) => {
          if (typeof value === 'string') return value.trim().length > 0
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some((v) =>
              typeof v === 'string' ? v.trim().length > 0 : !!v
            )
          }
          return !!value
        })

        if (hasData) {
          localStorage.setItem(storageKey, JSON.stringify({
            data: formData,
            timestamp: Date.now(),
          }))
        }
      } catch (error) {
        console.error('Failed to save form draft:', error)
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, storageKey, enabled])

  // Restore draft from localStorage on mount
  const restoreDraft = useCallback(() => {
    if (!enabled) return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null

      const { data, timestamp } = JSON.parse(stored)

      // Only restore drafts less than 24 hours old
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(storageKey)
        return null
      }

      return {
        data,
        timestamp,
        age: Date.now() - timestamp,
      }
    } catch (error) {
      console.error('Failed to restore form draft:', error)
      return null
    }
  }, [storageKey, enabled])

  // Apply draft data to form
  const applyDraft = useCallback((draftData: Partial<T>) => {
    if (!draftData) return

    Object.entries(draftData).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue(key as any, value, { shouldValidate: false })
    })
  }, [setValue])

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Failed to clear form draft:', error)
    }
  }, [storageKey])

  return {
    restoreDraft,
    applyDraft,
    clearDraft,
  }
}
