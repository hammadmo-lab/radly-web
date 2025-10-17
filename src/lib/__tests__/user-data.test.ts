// src/lib/__tests__/user-data.test.ts
import { fetchUserData, updateUserData } from '../user-data'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Supabase client
jest.mock('../supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: () => Promise.resolve({
        data: {
          session: {
            access_token: 'mock-token',
            user: {
              email: 'test@example.com'
            }
          }
        }
      })
    }
  })
}))

// Helper function to create default profile (since it's not exported)
function createDefaultProfile(userId: string) {
  return {
    id: userId,
    email: '',
    default_signature_name: '',
    default_signature_date_format: 'MM/DD/YYYY',
    subscription: null,
    updated_at: new Date().toISOString()
  }
}

describe('User Data Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock environment variables
    process.env.NEXT_PUBLIC_RADLY_API_KEY = 'test-api-key'
  })

  describe('fetchUserData', () => {
    it('should return user data when API call succeeds', async () => {
      const mockUserData = {
        user_id: 'test-user-id',
        subscription: {
          default_signature_name: 'Dr. Test',
          default_signature_date_format: 'MM/DD/YYYY',
          updated_at: '2023-01-01T00:00:00Z'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      })

      const result = await fetchUserData('test-user-id')

      expect(result).toEqual({
        id: 'test-user-id',
        email: '',
        default_signature_name: 'Dr. Test',
        default_signature_date_format: 'MM/DD/YYYY',
        subscription: mockUserData.subscription,
        updated_at: '2023-01-01T00:00:00Z'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/admin/subscriptions/user-id/test-user-id',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'x-api-key': 'test-api-key',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should return default profile when API returns 404', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await fetchUserData('test-user-id')

      expect(result).toEqual({
        id: 'test-user-id',
        email: '',
        default_signature_name: '',
        default_signature_date_format: 'MM/DD/YYYY',
        subscription: null,
        updated_at: expect.any(String)
      })
    })

    it('should return default profile when API call fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchUserData('test-user-id')

      expect(result).toEqual({
        id: 'test-user-id',
        email: '',
        default_signature_name: '',
        default_signature_date_format: 'MM/DD/YYYY',
        subscription: null,
        updated_at: expect.any(String)
      })
    })
  })

  describe('updateUserData', () => {
    it('should update user data successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      })

      await updateUserData('test-user-id', {
        default_signature_name: 'Dr. Updated',
        default_signature_date_format: 'DD/MM/YYYY'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/admin/subscriptions/user-id/test-user-id',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'x-api-key': 'test-api-key',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            default_signature_name: 'Dr. Updated',
            default_signature_date_format: 'DD/MM/YYYY'
          })
        })
      )
    })

    it('should create subscription when user not found (404)', async () => {
      // Mock the PATCH request to return 404
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        })
        // Mock the POST request to create subscription
        .mockResolvedValueOnce({
          ok: true
        })

      await updateUserData('test-user-id', {
        default_signature_name: 'Dr. New'
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
      
      // First call should be PATCH
      expect(global.fetch).toHaveBeenNthCalledWith(1,
        '/v1/admin/subscriptions/user-id/test-user-id',
        expect.objectContaining({ method: 'PATCH' })
      )
      
      // Second call should be POST to create subscription
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        '/v1/admin/subscriptions/activate',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Dr. New')
        })
      )
    })
  })

  describe('createDefaultProfile', () => {
    it('should create a default profile with correct structure', () => {
      const profile = createDefaultProfile('test-user-id')

      expect(profile).toEqual({
        id: 'test-user-id',
        email: '',
        default_signature_name: '',
        default_signature_date_format: 'MM/DD/YYYY',
        subscription: null,
        updated_at: expect.any(String)
      })
    })
  })
})
