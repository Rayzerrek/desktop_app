import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CourseDashboard from './CourseDashboard'
import '@testing-library/jest-dom/vitest'

vi.mock('../services/LessonService', async () => {
  const mod = await vi.importActual('../services/LessonService')
  return {
    ...mod,
    lessonService: {
      getCourses: vi.fn().mockResolvedValue([
        {
          id: 'c1',
          title: 'Course One',
          description: 'Desc 1',
          difficulty: 'beginner',
          language: 'javascript',
          modules: [],
          color: '#4f46e5',
          isPublished: true,
        },
      ]),
    },
  }
})

vi.mock('../services/ProgressService', async () => {
  const mod = await vi.importActual('../services/ProgressService')
  return {
    ...mod,
    progressService: {
      getUserProgress: vi.fn().mockResolvedValue([]),
      calculateCourseProgress: vi.fn().mockReturnValue(0),
    },
  }
})

beforeEach(() => {
  localStorage.setItem('access_token', 'test-token')
  localStorage.setItem('user_id', 'user-1')
})

describe('CourseDashboard tabs', () => {
  it('renders fixed tabs and switches to all courses view', async () => {
    const user = userEvent.setup()
    render(<CourseDashboard onCourseSelect={() => {}} />)

    const allBtn = await screen.findByRole('button', {
      name: /Wszystkie kursy/i,
    })
    const mainBtn = screen.getByRole('button', { name: /Przegląd/i })

    expect(allBtn).toBeInTheDocument()
    expect(mainBtn).toBeInTheDocument()

    await user.click(allBtn)

    await waitFor(() => {
      expect(screen.getByText(/Wszystkie dostępne kursy/i)).toBeInTheDocument()
    })
  })
})
