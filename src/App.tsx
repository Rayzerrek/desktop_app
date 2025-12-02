import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import AuthPanel from './components/AuthPanel'
import LessonDemo from './components/LessonDemo'
import CourseDashboard from './components/CourseDashboard'
import AdminPanel from './components/AdminPanel'
import CodePlayground from './components/CodePlayground'
import { UserProfileDropdown } from './components/UserProfileDropdown'
import Toast, { ToastType } from './components/Toast'
import Button from './components/ui/Button'
import { lessonService } from './services/LessonService'
import { useAuth } from './hooks/useAuth'
import { invoke } from '@tauri-apps/api/core'
import './styles/App.css'
import ThemeToggle from './components/ThemeToggle'

function AppContent() {
  const { isAuthenticated, isAdmin, refreshAdmin, login, logout } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
  } | null>(null)


  useEffect(() => {
    if (isAuthenticated) {
      refreshAdmin()
    }
  }, [isAuthenticated, refreshAdmin])



  const handleDevLogin = async () => {
    try {
      const response = await invoke<{
        success: boolean
        message: string
        user_id?: string
        access_token?: string
        refresh_token?: string
      }>('login_user', {
        email: import.meta.env.VITE_DEV_LOGIN,
        password: import.meta.env.VITE_DEV_PASS,
      })

      if (response.success) {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token)
        }
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token)
        }
        if (response.user_id) {
          localStorage.setItem('user_id', response.user_id)
        }
        login()
        navigate('/dashboard')
      } else {
        setToast({
          message: 'Dev login failed: ' + response.message,
          type: 'error',
        })
      }
    } catch (error) {
      setToast({
        message: 'Dev login error: ' + error,
        type: 'error',
      })
    }
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />
    }
    return <>{children}</>
  }

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />
    }
    if (!isAdmin) {
      setToast({
        message: 'Brak dostępu! Przekierowuję...',
        type: 'error',
      })
      setTimeout(() => navigate('/dashboard'), 1000)
      return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground-dark">Brak dostępu</h1>
          </div>
        </div>
      )
    }
    return <>{children}</>
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

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div>
                <Button
                  onClick={handleDevLogin}
                  variant="purple"
                  size="sm"
                  className="fixed top-4 right-4 z-50 font-mono"
                >
                  DEV: Skip to Dashboard
                </Button>
                <AuthPanel onLoginSuccess={() => {
                  login()
                  navigate('/dashboard')
                }} />
              </div>
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>
                <div className="fixed top-4 right-4 z-50">
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserProfileDropdown />
                  </div>
                </div>

                <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
                  <Button onClick={logout} variant="danger" size="sm">
                    Wyloguj
                  </Button>
                  <Button onClick={() => navigate('/playground')} variant="blue" size="sm">
                    Code Playground
                  </Button>
                </div>

                {isAdmin && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="purple"
                    size="sm"
                    className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
                  >
                    Panel Admina
                  </Button>
                )}

                <CourseDashboard onCourseSelect={(courseId) => {
                  navigate(`/course/${courseId}`)
                }} />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Lesson Route */}
        <Route
          path="/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <LessonRoute />
            </ProtectedRoute>
          }
        />

        {/* Course Route - redirects to first lesson */}
        <Route
          path="/course/:courseId"
          element={
            <ProtectedRoute>
              <CourseRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel onBack={() => navigate('/dashboard')} />
            </AdminRoute>
          }
        />

        <Route
          path="/playground"
          element={
            <ProtectedRoute>
              <CodePlayground onBack={() => navigate('/dashboard')} />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard or auth */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
        />
      </Routes>
    </>
  )
}

function LessonRoute() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  if (!lessonId) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div>
      <Button
        onClick={() => navigate('/dashboard')}
        variant="secondary"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
      >
        ← Powrót do kursów
      </Button>
      <LessonDemo
        lessonId={lessonId}
        onNextLesson={(nextLessonId) => {
          navigate(`/lesson/${nextLessonId}`)
        }}
      />
    </div>
  )
}

function CourseRedirect() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) {
      navigate('/dashboard', { replace: true })
      return
    }

    const loadCourse = async () => {
      try {
        const courses = await lessonService.getCourses()
        const course = courses.find((c) => c.id === courseId)

        if (course && course.modules[0]?.lessons[0]) {
          const firstLessonId = course.modules[0].lessons[0].id
          navigate(`/lesson/${firstLessonId}`, { replace: true })
        } else {
          console.error('No lessons found in course!')
          navigate('/dashboard', { replace: true })
        }
      } catch (error) {
        console.error('Error loading course:', error)
        navigate('/dashboard', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted dark:text-muted-dark">Ładowanie kursu...</p>
        </div>
      </div>
    )
  }

  return null
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
