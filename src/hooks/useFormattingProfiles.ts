"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProfiles,
  getProfile,
  uploadTemplate,
  updateProfile,
  deleteProfile,
  setDefaultProfile,
  getDefaultProfile,
  type FormattingConfig,
} from '@/lib/api/formatting';
import { toast } from 'sonner';
import type { ApiError } from '@/types/api';

// Query keys
export const formattingKeys = {
  all: ['formatting'] as const,
  profiles: () => [...formattingKeys.all, 'profiles'] as const,
  profile: (id: string) => [...formattingKeys.all, 'profile', id] as const,
  default: () => [...formattingKeys.all, 'default'] as const,
};

/**
 * Hook to fetch all formatting profiles
 */
export function useFormattingProfiles() {
  return useQuery({
    queryKey: formattingKeys.profiles(),
    queryFn: listProfiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      const apiError = error as ApiError;
      // Don't retry on 401, 403, 404
      if (apiError.status && [401, 403, 404].includes(apiError.status)) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch a specific formatting profile
 */
export function useFormattingProfile(profileId: string | null) {
  return useQuery({
    queryKey: formattingKeys.profile(profileId || ''),
    queryFn: () => getProfile(profileId!),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const apiError = error as ApiError;
      if (apiError.status && [401, 403, 404].includes(apiError.status)) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch the default formatting profile
 */
export function useDefaultProfile() {
  return useQuery({
    queryKey: formattingKeys.default(),
    queryFn: getDefaultProfile,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const apiError = error as ApiError;
      if (apiError.status && [401, 403, 404].includes(apiError.status)) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to upload a new template
 */
export function useUploadTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      profileName,
      isDefault,
    }: {
      file: File;
      profileName: string;
      isDefault: boolean;
    }) => {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.name.endsWith('.docx')) {
        throw new Error('Only DOCX files are accepted');
      }

      return uploadTemplate(file, profileName, isDefault);
    },
    onSuccess: (data) => {
      // Invalidate and refetch profiles
      queryClient.invalidateQueries({ queryKey: formattingKeys.profiles() });

      // If this is the default, invalidate the default query too
      if (data.is_default) {
        queryClient.invalidateQueries({ queryKey: formattingKeys.default() });
      }

      toast.success(`Profile "${data.profile_name}" created successfully`);
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to upload template';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a formatting profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      data,
    }: {
      profileId: string;
      data: { profile_name?: string; formatting_config?: FormattingConfig };
    }) => updateProfile(profileId, data),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: formattingKeys.profiles() });
      queryClient.invalidateQueries({ queryKey: formattingKeys.profile(data.profile_id) });

      if (data.is_default) {
        queryClient.invalidateQueries({ queryKey: formattingKeys.default() });
      }

      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

/**
 * Hook to delete a formatting profile
 */
export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: (_, profileId) => {
      queryClient.invalidateQueries({ queryKey: formattingKeys.profiles() });
      queryClient.invalidateQueries({ queryKey: formattingKeys.default() });
      queryClient.removeQueries({ queryKey: formattingKeys.profile(profileId) });

      toast.success('Profile deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete profile');
    },
  });
}

/**
 * Hook to set a profile as default
 */
export function useSetDefaultProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formattingKeys.profiles() });
      queryClient.invalidateQueries({ queryKey: formattingKeys.default() });
      queryClient.setQueryData(formattingKeys.profile(data.profile_id), data);

      toast.success(`"${data.profile_name}" is now your default profile`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set default profile');
    },
  });
}
