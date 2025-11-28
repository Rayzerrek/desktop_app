import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPanel from './AdminPanel'
import '@testing-library/jest-dom/vitest'




const {mockGetCourses, mockCreateCourse, mockCreateModule, mockCreateLesson, mockDeleteCourse, mockDeleteLesson} = vi.hoisted(() => ({
  mockGetCourses: vi.fn(),
  mockCreateCourse: vi.fn(),
  mockCreateModule: vi.fn(),
  mockCreateLesson: vi.fn(),
  mockDeleteCourse: vi.fn(),
  mockDeleteLesson: vi.fn(),
}))

vi.mock('../services/LessonService', () => ({
  lessonService: {
    getCourses: mockGetCourses,
    createCourse: mockCreateCourse,
    createModule: mockCreateModule,
    createLesson: mockCreateLesson,
    deleteCourse: mockDeleteCourse,
    deleteLesson: mockDeleteLesson,
  },
}))

vi.stubGlobal('confirm', vi.fn(() => true))
vi.stubGlobal('alert', vi.fn())

const mockCourses = [
  {
    id: 'course-1',
    title: 'Python Basics',
    description: 'Learn Python',
    difficulty: 'beginner',
    language: 'python',
    color: '#3B82F6',
    order_index: 0,
    is_published: true,
    modules: [
      {
        id: 'module-1',
        course_id: 'course-1',
        title: 'Getting Started',
        description: 'First steps',
        order_index: 0,
        iconEmoji: '🚀',
        lessons: [
          {
            id: 'lesson-1',
            module_id: 'module-1',
            title: 'Hello World',
            lesson_type: 'exercise',
            language: 'python',
            xp_reward: 10,
            order_index: 0,
            is_locked: false,
            content: {},
          },
        ],
      },
    ],
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCourses.mockResolvedValue(mockCourses)
  mockCreateCourse.mockResolvedValue({ id: 'new-course', title: 'New Course', modules: [] })
  mockCreateModule.mockResolvedValue({ id: 'new-module', title: 'New Module' })
  mockCreateLesson.mockResolvedValue({ id: 'new-lesson', title: 'New Lesson' })
  mockDeleteCourse.mockResolvedValue(undefined)
  mockDeleteLesson.mockResolvedValue(undefined)
})

describe('AdminPanel', () => {
  describe('Rendering', () => {
    it('renders header with title and back button', async () => {
      render(<AdminPanel onBack={() => {}} />)
      
      expect(screen.getByText('Panel Admina')).toBeInTheDocument()
      expect(screen.getByText('Powrót')).toBeInTheDocument()
    })

    it('renders all navigation tabs', async () => {
      render(<AdminPanel onBack={() => {}} />)
      
      expect(screen.getByRole('button', { name: /Kursy/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Utwórz kurs/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Wszystkie lekcje/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Utwórz lekcję/i })).toBeInTheDocument()
    })

    it('shows loading state then courses', async () => {
      render(<AdminPanel onBack={() => {}} />)
      
      expect(screen.getByText('Ładowanie...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Python Basics')).toBeInTheDocument()
      })
    })

    it('calls onBack when back button is clicked', async () => {
      const onBack = vi.fn()
      const user = userEvent.setup()
      render(<AdminPanel onBack={onBack} />)
      
      await user.click(screen.getByText('Powrót'))
      
      expect(onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Tab Navigation', () => {
    it('switches to courses tab and shows course list', async () => {
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => {
        expect(screen.getByText('Lista kursów')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Python Basics')).toBeInTheDocument()
      expect(screen.getByText('1 modułów • 1 lekcji')).toBeInTheDocument()
    })

    it('switches to create-course tab', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: /Utwórz kurs/i }))
      
      expect(screen.getByText('Utwórz nowy kurs i moduły')).toBeInTheDocument()
      expect(screen.getByText('Krok 1: Utwórz kurs')).toBeInTheDocument()
    })

    it('switches to lessons tab and shows all lessons', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: /Wszystkie lekcje/i }))
      
      expect(screen.getAllByText('Wszystkie lekcje')[0]).toBeInTheDocument()
      expect(screen.getByText('Hello World')).toBeInTheDocument()
      expect(screen.getByText(/Python Basics.*python.*10 XP/)).toBeInTheDocument()
    })

    it('switches to create-lesson tab and shows warning if no module selected', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: /Utwórz lekcję/i }))
      
      expect(screen.getByText('Najpierw wybierz moduł')).toBeInTheDocument()
    })
  })

  describe('Course Management', () => {
    it('selects a course and shows its modules', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: 'Wybierz' }))
      
      expect(screen.getByText('Moduły w tym kursie:')).toBeInTheDocument()
      expect(screen.getByText(/🚀 Getting Started/)).toBeInTheDocument()
    })

    it('toggles course selection', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: 'Wybierz' }))
      expect(screen.getByText('Moduły w tym kursie:')).toBeInTheDocument()
      
      await user.click(screen.getByRole('button', { name: 'Wybrany' }))
      
      
      expect(screen.queryByText('Moduły w tym kursie:')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Wybierz' })).toBeInTheDocument()
    })

    it('selects a module within a course', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: 'Wybierz' }))
      
      await user.click(screen.getByText(/🚀 Getting Started/))
      
      
      expect(screen.getAllByText('Wybrany')).toHaveLength(2)
      expect(screen.getByRole('button', { name: 'Dodaj lekcję' })).toBeInTheDocument()
    })

    it('creates a new course', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      
      const tabButtons = screen.getAllByRole('button', { name: /Utwórz kurs/i })
      await user.click(tabButtons[0])
      
      await user.type(screen.getByPlaceholderText('np. Python dla początkujących'), 'JavaScript Advanced')
      await user.type(screen.getByPlaceholderText('Krótki opis kursu'), 'Advanced JS concepts')
      
      const submitButtons = screen.getAllByRole('button', { name: /Utwórz kurs/i })
      await user.click(submitButtons[1])
      
      await waitFor(() => {
        expect(mockCreateCourse).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'JavaScript Advanced',
            description: 'Advanced JS concepts',
          })
        )
      })
    })

    it('deletes a course after confirmation', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: 'Usuń' }))
      
      expect(window.confirm).toHaveBeenCalled()
      expect(mockDeleteCourse).toHaveBeenCalledWith('course-1')
    })
  })

  describe('Module Creation', () => {
    it('shows module form after creating a course', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      const tabButtons = screen.getAllByRole('button', { name: /Utwórz kurs/i })
      await user.click(tabButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Utwórz nowy kurs i moduły')).toBeInTheDocument()
      })
      
      await user.type(screen.getByPlaceholderText('np. Python dla początkujących'), 'New Course')
      
      const submitButtons = screen.getAllByRole('button', { name: /Utwórz kurs/i })
      await user.click(submitButtons[1])
      
      await waitFor(() => {
        expect(screen.getByText(/Krok 2: Dodaj moduł/)).toBeInTheDocument()
      })
    })
  })

  describe('Lesson Management', () => {
    it('opens lesson edit dialog when edit is clicked', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: /Wszystkie lekcje/i }))
      
      await user.click(screen.getByRole('button', { name: 'Edytuj' }))
      
    })

    it('shows lesson form with selected module info', async () => {
      const user = userEvent.setup()
      render(<AdminPanel onBack={() => {}} />)
      
      await waitFor(() => screen.getByText('Python Basics'))
      
      await user.click(screen.getByRole('button', { name: 'Wybierz' }))
      
      await user.click(screen.getByText(/🚀 Getting Started/))
      
      await user.click(screen.getByRole('button', { name: /Utwórz lekcję/i }))
      
      expect(screen.getByText('Dodajesz lekcję do:')).toBeInTheDocument()
      expect(screen.getByText(/Getting Started/)).toBeInTheDocument()
    })
  })
})

describe('AdminTabs', () => {
  it('highlights active tab correctly', async () => {
    const user = userEvent.setup()
    render(<AdminPanel onBack={() => {}} />)
    
    await waitFor(() => screen.getByText('Python Basics'))
    
    const coursesTab = screen.getByRole('button', { name: /^Kursy$/i })
    expect(coursesTab).toHaveClass('bg-gradient-to-r')
    
    await user.click(screen.getByRole('button', { name: /Wszystkie lekcje/i }))
    
    const lessonsTab = screen.getByRole('button', { name: /Wszystkie lekcje/i })
    expect(lessonsTab).toHaveClass('bg-gradient-to-r')
  })
})
