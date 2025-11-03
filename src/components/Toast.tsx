import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md`}
      >
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full font-bold text-lg">
          {icons[type]}
        </div>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded transition"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
