const inputStyle =
  'w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500'
const labelStyle = 'block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
interface InputProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
}

export const Input = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: InputProps) => (
  <div className="form-group">
    <label className={labelStyle}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={inputStyle}
    />
  </div>
)
