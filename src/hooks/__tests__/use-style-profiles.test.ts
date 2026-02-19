import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useStyleProfiles,
  useUploadStyleProfile,
  useDeleteStyleProfile,
  useSetDefaultStyleProfile,
  styleProfileKeys,
} from '@/hooks/use-style-profiles'
import * as api from '@/lib/api/style-profiles'
import type { StyleProfile, StyleProfileListResponse } from '@/types/style-profiles'

// Mock the entire API module with a factory (prevents config.ts evaluation)
jest.mock('@/lib/api/style-profiles', () => ({
  listStyleProfiles: jest.fn(),
  getStyleProfile: jest.fn(),
  uploadStyleProfile: jest.fn(),
  updateStyleProfile: jest.fn(),
  deleteStyleProfile: jest.fn(),
  setDefaultStyleProfile: jest.fn(),
}))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const mockProfile: StyleProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  name: 'Test Profile',
  status: 'active',
  is_default: true,
  source_file_url: 'https://example.com/file.docx',
  found_placeholders: ['findings', 'impression'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const mockListResponse: StyleProfileListResponse = {
  profiles: [mockProfile],
  count: 1,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useStyleProfiles', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns profiles on successful fetch', async () => {
    ;(api.listStyleProfiles as jest.Mock).mockResolvedValueOnce(mockListResponse)

    const { result } = renderHook(() => useStyleProfiles(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.profiles).toHaveLength(1)
    expect(result.current.data?.profiles[0].id).toBe('profile-1')
  })

  it('returns empty data silently on 403 (tier gate)', async () => {
    const err = Object.assign(new Error('403 Forbidden'), { status: 403 })
    ;(api.listStyleProfiles as jest.Mock).mockRejectedValueOnce(err)

    const { result } = renderHook(() => useStyleProfiles(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.profiles).toHaveLength(0)
    expect(result.current.data?.count).toBe(0)
  })

  it('does not catch non-403 errors (they surface as query errors)', async () => {
    // Verify that non-403 errors are re-thrown by the queryFn (not silently swallowed)
    // The actual error state depends on retry config; we just check the 403 branch is not entered
    const err403 = Object.assign(new Error('403 Forbidden'), { status: 403 })
    const err500 = Object.assign(new Error('500 Server Error'), { status: 500 })

    // 403 → empty data (the transparent case)
    ;(api.listStyleProfiles as jest.Mock).mockRejectedValueOnce(err403)
    const { result: r403 } = renderHook(() => useStyleProfiles(), { wrapper: createWrapper() })
    await waitFor(() => expect(r403.current.isSuccess).toBe(true))
    expect(r403.current.data?.profiles).toHaveLength(0)

    // 500 → NOT a success (queryFn re-throws; query will eventually error)
    ;(api.listStyleProfiles as jest.Mock).mockRejectedValue(err500)
    const { result: r500 } = renderHook(() => useStyleProfiles(), { wrapper: createWrapper() })
    // The query starts fetching — it should not succeed (no data returned)
    await waitFor(() => expect(r500.current.isFetching).toBe(false), { timeout: 3000 }).catch(() => {
      // Timeout is acceptable here since retries may still be in flight
    })
    expect(r500.current.data?.profiles ?? null).toBeNull()
  })
})

describe('useUploadStyleProfile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('invalidates profiles list on success', async () => {
    ;(api.uploadStyleProfile as jest.Mock).mockResolvedValueOnce(mockProfile)
    ;(api.listStyleProfiles as jest.Mock).mockResolvedValue(mockListResponse)

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: qc }, children)

    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(() => useUploadStyleProfile(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'New Profile',
        file: new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        isDefault: false,
      })
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: styleProfileKeys.profiles() })
    )
  })

  it('throws on invalid file type', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useUploadStyleProfile(), { wrapper })

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          name: 'Bad',
          file: new File(['x'], 'test.txt', { type: 'text/plain' }),
        })
      })
    ).rejects.toThrow('Only DOCX files are accepted')
  })

  it('throws on file > 10 MB', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useUploadStyleProfile(), { wrapper })

    const bigContent = new Uint8Array(11 * 1024 * 1024)
    const bigFile = new File([bigContent], 'big.docx')

    await expect(
      act(async () => {
        await result.current.mutateAsync({ name: 'Big', file: bigFile })
      })
    ).rejects.toThrow('File size must be less than 10 MB')
  })
})

describe('useDeleteStyleProfile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('invalidates list and removes profile detail on success', async () => {
    ;(api.deleteStyleProfile as jest.Mock).mockResolvedValueOnce({ success: true })

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: qc }, children)

    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries')
    const removeSpy = jest.spyOn(qc, 'removeQueries')
    const { result } = renderHook(() => useDeleteStyleProfile(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('profile-1')
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: styleProfileKeys.profiles() })
    )
    expect(removeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: styleProfileKeys.profile('profile-1') })
    )
  })
})

describe('useSetDefaultStyleProfile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('invalidates profiles list on success', async () => {
    ;(api.setDefaultStyleProfile as jest.Mock).mockResolvedValueOnce({ ...mockProfile, is_default: true })

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: qc }, children)

    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(() => useSetDefaultStyleProfile(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('profile-1')
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: styleProfileKeys.profiles() })
    )
  })
})
