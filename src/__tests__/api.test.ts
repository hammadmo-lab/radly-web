import { api, ApiError } from '@/lib/api'

// Mock fetch
global.fetch = jest.fn()

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn().mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } }
      })
    }
  })
}))

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('timeout handling', () => {
    it('should timeout after specified timeout duration', async () => {
      ;(fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      )

      await expect(
        api.get('/test', { timeoutMs: 100 })
      ).rejects.toThrow()
    })

    it('should complete request within timeout', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await api.get('/test', { timeoutMs: 5000 })
      expect(result.data).toBe('test')
    })
  })

  describe('retry mechanism', () => {
    it('should retry failed requests', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }

      ;(fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse)

      await expect(api.get('/test', { retry: 1 })).rejects.toThrow()
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should succeed on retry', async () => {
      const mockSuccessResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'success' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      }

      ;(fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSuccessResponse)

      const result = await api.get('/test', { retry: 1 })
      expect(result.data).toBe('success')
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('should throw ApiError for HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }

      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(api.get('/test')).rejects.toThrow(ApiError)
    })

    it('should handle JSON error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad Request' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      try {
        await api.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).message).toBe('Bad Request')
      }
    })
  })

  describe('request configuration', () => {
    it('should add client key header', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      await api.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-client-key': expect.any(String)
          })
        })
      )
    })

    it('should add authorization header when session exists', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      await api.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
    })
  })
})
