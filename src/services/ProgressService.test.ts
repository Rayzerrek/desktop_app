import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ProgressService, UserProgress } from './ProgressService'
import { invoke } from '@tauri-apps/api/core'

vi.mock('@tauri-apps/api/core')

describe('ProgressService', () => {
  let service: ProgressService
  const mockDate = new Date('2023-01-01T00:00:00.000Z')
  const mockProgress: UserProgress = {
    user_id: 'user-1',
    lesson_id: 'lesson-1',
    status: 'in_progress',
    score: 85,
    completed_at: undefined,
    attempts: 2,
  }

  beforeEach(() => {
    service = new ProgressService()
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getUserProgress', () => {
    it('should call invoke with correct parameters', async () => {
      localStorage.setItem('access_token', 'test-token-123')
      vi.mocked(invoke).mockResolvedValue([mockProgress])
      const result = await service.getUserProgress('user-1')
      expect(invoke).toHaveBeenCalledWith('get_user_progress', {
        userId: 'user-1',
        accessToken: 'test-token-123',
      })
      expect(result).toEqual([mockProgress])
    })

    it('should throw an error if no access token is found', async () => {
      await expect(service.getUserProgress('user-1')).rejects.toThrow(
        'No access token'
      )
    })
  })

  describe('updateLessonProgress', () => {
    it("should call invoke with correct parameters for 'in_progress' status", async () => {
      localStorage.setItem('access_token', 'test-token-456')
      vi.mocked(invoke).mockResolvedValue(mockProgress)

      await service.updateLessonProgress('user-1', 'lesson-1', 'in_progress', {
        score: 85,
        attempts: 2,
      })

      expect(invoke).toHaveBeenCalledWith('update_lesson_progress', {
        progress: {
          user_id: 'user-1',
          lesson_id: 'lesson-1',
          status: 'in_progress',
          score: 85,
          attempts: 2,
          completed_at: undefined,
        },
        accessToken: 'test-token-456',
      })
    })

    it("should call invoke with completed_at for 'completed' status", async () => {
      localStorage.setItem('access_token', 'test-token-789')
      const completedProgress = {
        ...mockProgress,
        status: 'completed' as const,
      }
      vi.mocked(invoke).mockResolvedValue(completedProgress)

      await service.updateLessonProgress('user-1', 'lesson-1', 'completed', {
        score: 95,
        attempts: 3,
      })

      expect(invoke).toHaveBeenCalledWith('update_lesson_progress', {
        progress: {
          user_id: 'user-1',
          lesson_id: 'lesson-1',
          status: 'completed',
          score: 95,
          attempts: 3,
          completed_at: mockDate.toISOString(),
        },
        accessToken: 'test-token-789',
      })
    })

    it('should use 1 attempt if not provided', async () => {
      localStorage.setItem('access_token', 'test-token-456')
      vi.mocked(invoke).mockResolvedValue(mockProgress)

      await service.updateLessonProgress('user-1', 'lesson-1', 'in_progress', {
        score: 85,
      })

      expect(invoke).toHaveBeenCalledWith('update_lesson_progress', {
        progress: {
          user_id: 'user-1',
          lesson_id: 'lesson-1',
          status: 'in_progress',
          score: 85,
          attempts: 1,
          completed_at: undefined,
        },
        accessToken: 'test-token-456',
      })
    })

    it('should throw an error if no access token is found', async () => {
      await expect(
        service.updateLessonProgress('user-1', 'lesson-1', 'in_progress')
      ).rejects.toThrow('No access token')
    })
  })
})
