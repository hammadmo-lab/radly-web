/**
 * Integration tests verifying that enqueueJob correctly includes or omits
 * styleProfileId in the POST body sent to /v1/generate/async.
 */
import { enqueueJob } from '@/lib/jobs'
import { httpPost } from '@/lib/http'

jest.mock('@/lib/http', () => ({
  httpGet: jest.fn(),
  httpPost: jest.fn(),
}))

const mockHttpPost = httpPost as jest.Mock

describe('enqueueJob — styleProfileId wiring', () => {
  beforeEach(() => {
    mockHttpPost.mockResolvedValue({ job_id: 'job-123' })
  })

  afterEach(() => jest.clearAllMocks())

  it('includes styleProfileId (camelCase) in body when explicitly provided', async () => {
    await enqueueJob({
      templateId: 'tmpl-1',
      findings: 'No acute findings observed in the chest.',
      indication: 'Routine chest X-ray follow-up.',
      styleProfileId: 'profile-uuid-abc',
    })

    expect(mockHttpPost).toHaveBeenCalledTimes(1)
    const [path, body] = mockHttpPost.mock.calls[0]
    expect(path).toBe('/v1/generate/async')
    expect(body.styleProfileId).toBe('profile-uuid-abc')
  })

  it('omits styleProfileId when not provided', async () => {
    await enqueueJob({
      templateId: 'tmpl-1',
      findings: 'No acute findings observed in the chest.',
      indication: 'Routine chest X-ray follow-up.',
    })

    const [, body] = mockHttpPost.mock.calls[0]
    expect(body).not.toHaveProperty('styleProfileId')
  })

  it('omits styleProfileId when explicitly undefined', async () => {
    await enqueueJob({
      templateId: 'tmpl-1',
      findings: 'No acute findings observed in the chest.',
      indication: 'Routine chest X-ray follow-up.',
      styleProfileId: undefined,
    })

    const [, body] = mockHttpPost.mock.calls[0]
    expect(body).not.toHaveProperty('styleProfileId')
  })

  it('does not break existing fields when styleProfileId is absent', async () => {
    await enqueueJob({
      templateId: 'tmpl-2',
      findings: 'Normal study.',
      indication: 'Pre-operative evaluation.',
      technique: 'PA and lateral views.',
    })

    const [, body] = mockHttpPost.mock.calls[0]
    expect(body.template_id).toBe('tmpl-2')
    expect(body.technique).toBe('PA and lateral views.')
    expect(body).not.toHaveProperty('styleProfileId')
  })
})
