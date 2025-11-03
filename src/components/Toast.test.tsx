import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from './Toast'
import '@testing-library/jest-dom/vitest'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllTimers()
  })
  it('renders with correct message', () => {
    const onClose = vi.fn()
    render(<Toast message="Test message" type="success" onClose={onClose} />)

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('displays correct icon for success type', () => {
    const onClose = vi.fn()
    render(<Toast message="Success!" type="success" onClose={onClose} />)

    expect(screen.getAllByText('✓')).toHaveLength(1)
  })

  it('displays correct icon for error type', () => {
    const onClose = vi.fn()
    render(<Toast message="Error!" type="error" onClose={onClose} />)

    expect(screen.getAllByText('✕'))
  })

  it('calls onClose when close button is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Toast message="Test" type="info" onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close notification')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useFakeTimers()
  })

  it('auto-closes after default duration', () => {
    const onClose = vi.fn()
    render(<Toast message="Test" type="success" onClose={onClose} />)

    expect(onClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(4000)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('auto-closes after custom duration', () => {
    const onClose = vi.fn()
    render(
      <Toast message="Test" type="success" onClose={onClose} duration={2000} />
    )

    vi.advanceTimersByTime(2000)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('applies correct background color for each type', () => {
    const onClose = vi.fn()
    const { rerender, container } = render(
      <Toast message="Test" type="success" onClose={onClose} />
    )
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument()

    rerender(<Toast message="Test" type="error" onClose={onClose} />)
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument()

    rerender(<Toast message="Test" type="info" onClose={onClose} />)
    expect(container.querySelector('.bg-blue-500')).toBeInTheDocument()

    rerender(<Toast message="Test" type="warning" onClose={onClose} />)
    expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument()
  })
})
