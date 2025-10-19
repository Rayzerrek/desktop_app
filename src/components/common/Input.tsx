const inputStyle = "w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200";
const labelStyle = "block text-sm font-medium text-slate-700 mb-2";
interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?:number;
}

export const Input = ({ label, type, value, onChange, placeholder, required }: InputProps) => (
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
);