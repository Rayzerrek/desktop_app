import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CourseForm from './CourseForm'


beforeEach(() => {
  vi.clearAllMocks();
})

describe('CourseForm', () => {
  it('renders all form fields', () => {
    render(<CourseForm onSubmit={vi.fn()} />)
    
    expect(screen.getByText('Krok 1: Utwórz kurs')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('np. Python dla początkujących')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Krótki opis kursu')).toBeInTheDocument()
    expect(screen.getByText('Język programowania *')).toBeInTheDocument()
    expect(screen.getByText('Poziom trudności')).toBeInTheDocument()
    expect(screen.getByText('Szacowany czas (h)')).toBeInTheDocument()
    expect(screen.getByText('Kolor')).toBeInTheDocument()
  })

  it('has submit button disabled when title is empty', () => {
    render(<CourseForm onSubmit={vi.fn()} />)
    
    const submitButton = screen.getByRole('button', { name: 'Utwórz kurs'})
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when title is filled', async () => {
    const user = userEvent.setup()
    render(<CourseForm onSubmit={vi.fn()} />)
    
    await user.type(screen.getByPlaceholderText('np. Python dla początkujących'), 'Test Course')
    
    const submitButton = screen.getByRole('button', { name: 'Utwórz kurs' })
    expect(submitButton).not.toBeDisabled()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<CourseForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByPlaceholderText('np. Python dla początkujących'), 'JavaScript Basics')
    await user.type(screen.getByPlaceholderText('Krótki opis kursu'), 'Learn JS fundamentals')
    
    await user.click(screen.getByRole('button', { name: 'Utwórz kurs' }))
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        color:'#3B82F6',
        title: 'JavaScript Basics',
        description: 'Learn JS fundamentals',
        difficulty: 'beginner',
        language: 'python',
        estimatedHours: 10,
      })
    )
  })

  it('resets form after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<CourseForm onSubmit={onSubmit} />)
    
    const titleInput = screen.getByPlaceholderText('np. Python dla początkujących')
    await user.type(titleInput, 'Test Course')
    await user.click(screen.getByRole('button', { name: 'Utwórz kurs' }))
    
    await expect(titleInput).toHaveValue('')
  })

  it('allows selecting different language', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<CourseForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByPlaceholderText('np. Python dla początkujących'), 'JavaScript Basics')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Jezyk programowania' }), 'javascript')
    await user.click(screen.getByRole('button', { name: 'Utwórz kurs' }))
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        language:'javascript',
      })
    )


  })

  it('allows selecting different difficulty', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<CourseForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByPlaceholderText('np. Python dla początkujących'), 'Advanced Course')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Poziom trudnosci' }), 'advanced')
    await user.click(screen.getByRole('button', { name: 'Utwórz kurs' }))
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        difficulty: 'advanced',
      })
    )
  })
})
