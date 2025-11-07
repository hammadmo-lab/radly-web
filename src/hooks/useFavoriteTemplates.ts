/**
 * useFavoriteTemplates Hook
 *
 * Manages favorite templates with localStorage persistence.
 * Provides functions to add, remove, and check favorite status.
 */

import { useState, useCallback, useEffect } from 'react'

const FAVORITES_KEY = 'radly_favorite_templates'

export interface UseFavoriteTemplatesReturn {
  /**
   * Set of template IDs that are favorited
   */
  favorites: Set<string>

  /**
   * Check if a template is favorited
   */
  isFavorite: (templateId: string) => boolean

  /**
   * Toggle favorite status for a template
   */
  toggleFavorite: (templateId: string) => void

  /**
   * Add a template to favorites
   */
  addFavorite: (templateId: string) => void

  /**
   * Remove a template from favorites
   */
  removeFavorite: (templateId: string) => void

  /**
   * Get all favorite template IDs as array
   */
  getFavoriteIds: () => string[]

  /**
   * Clear all favorites
   */
  clearFavorites: () => void

  /**
   * Number of favorite templates
   */
  count: number
}

/**
 * Hook to manage favorite templates
 * Uses localStorage for persistence across sessions
 *
 * @returns Object with favorite management methods
 *
 * @example
 * ```tsx
 * const { isFavorite, toggleFavorite, favorites } = useFavoriteTemplates()
 *
 * return (
 *   <button onClick={() => toggleFavorite(templateId)}>
 *     {isFavorite(templateId) ? '★ Favorited' : '☆ Add to Favorites'}
 *   </button>
 * )
 * ```
 */
export function useFavoriteTemplates(): UseFavoriteTemplatesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        setFavorites(new Set(parsed))
      }
    } catch (error) {
      console.error('Failed to load favorite templates:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return

    try {
      const array = Array.from(favorites)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(array))
    } catch (error) {
      console.error('Failed to save favorite templates:', error)
    }
  }, [favorites, isHydrated])

  const isFavorite = useCallback(
    (templateId: string): boolean => {
      return favorites.has(templateId)
    },
    [favorites]
  )

  const addFavorite = useCallback((templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.add(templateId)
      return next
    })
  }, [])

  const removeFavorite = useCallback((templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.delete(templateId)
      return next
    })
  }, [])

  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
  }, [])

  const getFavoriteIds = useCallback((): string[] => {
    return Array.from(favorites)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites(new Set())
  }, [])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    getFavoriteIds,
    clearFavorites,
    count: favorites.size,
  }
}
