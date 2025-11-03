import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import Toast, { ToastType } from './Toast'

interface AuthResponse {
  success: boolean
  message: string
  user_id?: string
  access_token?: string
  refresh_token?: string
}

interface AuthPanelProps {
  onLoginSuccess?: () => void
}

export default function AuthPanel({ onLoginSuccess }: AuthPanelProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
  } | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const authUrl = await invoke<string>('google_sign_in')
      window.open(authUrl, '_blank')

      setToast({
        message: 'Otwarto przeglądarkę. Zaloguj się przez Google.',
        type: 'info',
      })
    } catch (error) {
      setToast({
        message: 'Błąd podczas logowania przez Google: ' + error,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await invoke<AuthResponse>('login_user', {
        email,
        password,
      })

      if (response.success) {
        setToast({
          message: response.message,
          type: 'success',
        })
        console.log('User ID:', response.user_id)

        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token)
        }
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token)
        }
        if (response.user_id) {
          localStorage.setItem('user_id', response.user_id)
        }

        setTimeout(() => {
          onLoginSuccess?.()
        }, 1000)
      } else {
        setToast({
          message: response.message,
          type: 'error',
        })
      }
    } catch (error) {
      setToast({
        message: 'Błąd podczas logowania: ' + error,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (
    email: string,
    password: string,
    username: string
  ) => {
    setLoading(true)
    try {
      const response = await invoke<AuthResponse>('register_user', {
        email,
        password,
        username,
      })

      if (response.success) {
        setToast({
          message: response.message,
          type: 'success',
        })
        console.log('User ID:', response.user_id)

        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token)
        }
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token)
        }
        if (response.user_id) {
          localStorage.setItem('user_id', response.user_id)
        }

        setTimeout(() => {
          if (response.access_token) {
            onLoginSuccess?.()
          } else {
            setIsLogin(true)
          }
        }, 1000)
      } else {
        setToast({
          message: response.message,
          type: 'error',
        })
      }
    } catch (error) {
      setToast({
        message: 'Błąd podczas rejestracji: ' + error,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-8"
          style={{
            boxShadow:
              '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Witaj ponownie!' : 'Dołącz do nas!'}
            </h1>
            <p className="text-slate-600 text-lg">
              {isLogin
                ? 'Zaloguj się, aby kontynuować naukę'
                : 'Stwórz konto i zacznij swoją przygodę'}
            </p>
          </div>

          <div className="flex gap-2 mb-8 bg-slate-100 rounded-full p-1.5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}
            >
              Logowanie
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}
            >
              Rejestracja
            </button>
          </div>

          {isLogin ? (
            <LoginForm onSubmit={handleLogin} disabled={loading} />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              onError={(message) => setToast({ message, type: 'error' })}
              disabled={loading}
            />
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-slate-500">Lub</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-slate-700">
                Kontynuuj z Google
              </span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? (
              <p>
                Nie masz konta?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:cursor-pointer"
                >
                  Zarejestruj się
                </button>
              </p>
            ) : (
              <p>
                Masz już konto?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-green-600 hover:text-green-700 font-medium hover:cursor-pointer"
                >
                  Zaloguj się
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
