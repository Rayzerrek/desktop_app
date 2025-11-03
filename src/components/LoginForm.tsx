import { useState } from 'react'
import { Input } from './common/Input'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
  disabled?: boolean
}

export default function LoginForm({
  onSubmit,
  disabled = false,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        placeholder="twoj@email.com"
      />

      <Input
        label="Hasło"
        type="password"
        value={password}
        onChange={setPassword}
        required
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? 'Logowanie...' : 'Zaloguj się'}
      </button>
    </form>
  )
}
