import { useState } from 'react'
import { Input } from './common/Input'

interface RegisterFormProps {
  onSubmit: (email: string, password: string, username: string) => void
  onError?: (message: string) => void
  disabled?: boolean
}

export default function RegisterForm({
  onSubmit,
  onError,
  disabled = false,
}: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      onError?.('Hasła nie są identyczne!')
      return
    }
    onSubmit(email, password, username)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nazwa użytkownika"
        type="text"
        value={username}
        onChange={setUsername}
        required
        placeholder="twoja_nazwa"
      />
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

      <Input
        label="Potwierdź hasło"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
        minLength={8}
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium py-4 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {disabled ? 'Rejestracja...' : 'Zarejestruj się'}
      </button>
    </form>
  )
}
