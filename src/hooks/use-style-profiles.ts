"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listStyleProfiles,
  getStyleProfile,
  uploadStyleProfile,
  updateStyleProfile,
  deleteStyleProfile,
  setDefaultStyleProfile,
} from '@/lib/api/style-profiles'
import { toast } from 'sonner'
import type { ApiError } from '@/types/api'
import type { UpdateStyleProfileRequest, StyleProfileListResponse } from '@/types/style-profiles'

/** Query key factory — keeps all style-profile keys co-located. */
export const styleProfileKeys = {
  all: ['style-profiles'] as const,
  profiles: () => [...styleProfileKeys.all, 'list'] as const,
  profile: (id: string) => [...styleProfileKeys.all, 'detail', id] as const,
}

/** @returns true when the error should not be retried */
function noRetry(failureCount: number, error: unknown): boolean {
  const status = (error as ApiError)?.status
  if (status && [401, 403, 404].includes(status)) return true
  return failureCount >= 3
}

/**
 * Fetch all style profiles for the current user.
 * Returns empty data (`{profiles: [], count: 0}`) on 403 — the feature is
 * silently unavailable for free/starter tiers without surfacing an error.
 */
export function useStyleProfiles() {
  return useQuery({
    queryKey: styleProfileKeys.profiles(),
    queryFn: async (): Promise<StyleProfileListResponse> => {
      try {
        return await listStyleProfiles()
      } catch (err) {
        const status = (err as ApiError)?.status
        if (status === 403) return { profiles: [], count: 0 }
        throw err
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      const status = (error as ApiError)?.status
      // 403 is handled transparently in queryFn — never retry
      if (status && [401, 403, 404].includes(status)) return false
      return failureCount < 3
    },
  })
}

/**
 * Fetch a single style profile by ID.
 * Disabled when no id is provided.
 */
export function useStyleProfile(id: string | null) {
  return useQuery({
    queryKey: styleProfileKeys.profile(id || ''),
    queryFn: () => getStyleProfile(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
    retry: (failureCount, error) => !noRetry(failureCount, error),
  })
}

/**
 * Mutation to upload a new style profile from a DOCX file.
 * Validates file type (.docx) and size (10 MB) client-side before upload.
 * The backend validates that required placeholder tags are present and returns
 * a user-friendly 400 error message if any are missing.
 * Invalidates the list query on success.
 */
export function useUploadStyleProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      name,
      file,
      isDefault,
    }: {
      name: string
      file: File
      isDefault?: boolean
    }) => {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        throw new Error('Only DOCX files are accepted')
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10 MB')
      }
      return uploadStyleProfile(name, file, isDefault)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: styleProfileKeys.profiles() })
      toast.success(`"${data.name}" is active and ready to use`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload style profile')
    },
  })
}

/**
 * Mutation to update a style profile's name or status.
 * Invalidates both the list and the individual profile queries on success.
 */
export function useUpdateStyleProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateStyleProfileRequest
    }) => updateStyleProfile(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: styleProfileKeys.profiles() })
      queryClient.invalidateQueries({ queryKey: styleProfileKeys.profile(data.id) })
      toast.success('Style profile updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update style profile')
    },
  })
}

/**
 * Mutation to delete a style profile.
 * Invalidates the list and removes the individual profile from cache on success.
 */
export function useDeleteStyleProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStyleProfile,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: styleProfileKeys.profiles() })
      queryClient.removeQueries({ queryKey: styleProfileKeys.profile(id) })
      toast.success('Style profile deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete style profile')
    },
  })
}

/**
 * Mutation to set a style profile as the user's default.
 * Invalidates the list query (all is_default flags are affected) on success.
 */
export function useSetDefaultStyleProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setDefaultStyleProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: styleProfileKeys.profiles() })
      toast.success(`"${data.name}" is now your default style profile`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set default style profile')
    },
  })
}
