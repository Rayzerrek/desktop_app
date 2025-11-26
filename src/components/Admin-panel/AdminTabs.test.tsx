import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminTabs, { AdminTabType } from './AdminTabs'
import '@testing-library/jest-dom/vitest'

describe('AdminTabs', () => {
  const defaultProps = {
    activeTab: 'courses' as AdminTabType,
    onTabChange: vi.fn(),
  }

  it('renders all four tabs', () => {
    render(<AdminTabs {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: /^Kursy$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Utwórz kurs/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Wszystkie lekcje/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Utwórz lekcję/i })).toBeInTheDocument()
  })

  it('highlights active tab with gradient', () => {
    render(<AdminTabs {...defaultProps} activeTab="courses" />)
    
    const coursesTab = screen.getByRole('button', { name: /^Kursy$/i })
    expect(coursesTab).toHaveClass('bg-gradient-to-r')
  })

  it('does not highlight inactive tabs', () => {
    render(<AdminTabs {...defaultProps} activeTab="courses" />)
    
    const lessonsTab = screen.getByRole('button', { name: /Wszystkie lekcje/i })
    expect(lessonsTab).not.toHaveClass('bg-gradient-to-r')
    expect(lessonsTab).toHaveClass('hover:bg-slate-100')
  })

  it('calls onTabChange with correct tab when clicked', async () => {
    const onTabChange = vi.fn()
    const user = userEvent.setup()
    render(<AdminTabs activeTab="courses" onTabChange={onTabChange} />)
    
    await user.click(screen.getByRole('button', { name: /Wszystkie lekcje/i }))
    expect(onTabChange).toHaveBeenCalledWith('lessons')
    
    await user.click(screen.getByRole('button', { name: /Utwórz kurs/i }))
    expect(onTabChange).toHaveBeenCalledWith('create-course')
    
    await user.click(screen.getByRole('button', { name: /Utwórz lekcję/i }))
    expect(onTabChange).toHaveBeenCalledWith('create')
    
    await user.click(screen.getByRole('button', { name: /^Kursy$/i }))
    expect(onTabChange).toHaveBeenCalledWith('courses')
  })

  it('changes active tab styling when activeTab prop changes', () => {
    const { rerender } = render(<AdminTabs {...defaultProps} activeTab="courses" />)
    
    expect(screen.getByRole('button', { name: /^Kursy$/i })).toHaveClass('bg-gradient-to-r')
    
    rerender(<AdminTabs {...defaultProps} activeTab="lessons" />)
    
    expect(screen.getByRole('button', { name: /^Kursy$/i })).not.toHaveClass('bg-gradient-to-r')
    expect(screen.getByRole('button', { name: /Wszystkie lekcje/i })).toHaveClass('bg-gradient-to-r')
  })
})
