import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LessonService } from './LessonService'
import { invoke } from '@tauri-apps/api/core'

vi.mock('@tauri-apps/api/core')

describe('LessonService - cache', () => {
  let service: LessonService

  beforeEach(() => {
    service = new LessonService()
    vi.clearAllMocks()
  })
  it('should cache courses on first call and return from cache on second call', async () => {
    const mockCourses = [
      {
        id: 'c1',
        title: 'Python 101',
        description: 'Learn Python',
        difficulty: 'beginner',
        language: 'python',
        modules: [],
        color: '#3B82F6',
        isPublished: true,
      },
    ]
    vi.mocked(invoke).mockResolvedValue(mockCourses)

    const result1 = await service.getCourses()
    const result2 = await service.getCourses()

    expect(result1).toEqual(mockCourses)
    expect(result2).toEqual(mockCourses)

    expect(invoke).toHaveBeenCalledTimes(1)
  })

  it('should cahce when refresh flag is true', async () => {
    const mockCourses = [{ id: 'c1', title: 'Course 1', modules: [] }]
    vi.mocked(invoke).mockResolvedValue(mockCourses)
    await service.getCourses(true)
    await service.getCourses(true)
    expect(invoke).toHaveBeenCalledTimes(2)
  })

  it('should handle API error gracefully', async () => {
    vi.mocked(invoke).mockRejectedValue(new Error('API Error'))

    await expect(service.getCourses()).rejects.toThrow('API Error')
  })

  it('should pass access token from localstorage when true', async () => {
    localStorage.setItem('access_token', 'test-token-123')
    vi.mocked(invoke).mockResolvedValue([])

    await service.getCourses()

    expect(invoke).toHaveBeenCalledWith('get_all_courses', {
      accessToken: 'test-token-123',
    })
  })
})
