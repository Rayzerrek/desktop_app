import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'purple' | 'blue'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md',
  secondary: 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg',
  purple: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg',
  blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-4 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const widthStyle = fullWidth ? 'w-full' : ''
  
  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyle}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex items-center gap-2">
        {icon}
        {children}
      </span>}
      {!icon && children}
    </button>
  )
}
