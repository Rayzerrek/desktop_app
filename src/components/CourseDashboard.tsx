import { Course } from '../types/lesson'
import { lessonService } from '../services/LessonService'
import { progressService, UserProgress } from '../services/ProgressService'
import { useEffect, useState } from 'react'
import CourseGrid from './CourseGrid'
import SearchBar from './Searchbar'

interface CourseDashboardProps {
  onCourseSelect: (courseId: string) => void
}

export default function CourseDashboard({
  onCourseSelect,
}: CourseDashboardProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'all'>('main')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])

  useEffect(() => {
    loadCourses()
    loadProgress()
  }, [])

  const loadCourses = async () => {
    try {
      const data = await lessonService.getCourses()
      setCourses(data)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const userId = localStorage.getItem('user_id')
      if (userId) {
        const progress = await progressService.getUserProgress(userId)
        setUserProgress(progress)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const getCourseProgress = (course: Course): number => {
    const lessonIds = course.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
    )
    return progressService.calculateCourseProgress(userProgress, lessonIds)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-300">Ładowanie kursów...</p>
        </div>
      </div>
    )
  }

  const handleSearchResultSelect = (result: {
    type: 'course' | 'lesson'
    id: string
  }) => {
    if (result.type === 'course') {
      onCourseSelect(result.id)
    } else {
      console.log('Selected lesson:', result.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Wybierz swój kurs
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Rozpocznij swoją przygodę z programowaniem. Wybierz kurs i zacznij
            naukę już teraz!
          </p>

          <div className="flex justify-center mb-6">
            <SearchBar
              onResultSelect={handleSearchResultSelect}
              placeholder="Szukaj kursów i lekcji..."
              className="w-full max-w-2xl"
            />
          </div>
        </div>


        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-4 mb-0 bg-white dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-700 shadow-lg w-full">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 text-lg ${
                activeTab === 'main'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Przegląd
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 text-lg ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Wszystkie kursy
            </button>
          </div>
        </div>

        <div className="h-20" />

        {activeTab === 'main' ? (
          <div className="space-y-12">
            {(() => {
              const startedCourses = courses.filter((course) => {
                const progress = getCourseProgress(course)
                return progress > 0 && progress < 100
              })
              if (startedCourses.length === 0) return null
              return (
                <section>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                    Kontynuuj naukę
                  </h2>
                  <CourseGrid
                    courses={startedCourses}
                    onCourseSelect={onCourseSelect}
                    getCourseProgress={getCourseProgress}
                  />
                </section>
              )
            })()}

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Polecane dla Ciebie
              </h2>
              {(() => {
                const started = courses.filter((course) => {
                  const progress = getCourseProgress(course)
                  return progress > 0 && progress < 100
                })
                const startedIds = new Set(started.map((c) => c.id))
                const recommended = courses
                  .filter(
                    (c) =>
                      !startedIds.has(c.id) &&
                      c.isPublished &&
                      getCourseProgress(c) < 100
                  )
                  .slice(0, 3)
                return (
                  <CourseGrid
                    courses={recommended}
                    onCourseSelect={onCourseSelect}
                    getCourseProgress={getCourseProgress}
                  />
                )
              })()}
            </section>

            {courses.filter((course) => {
              const progress = getCourseProgress(course)
              return progress > 0 && progress < 100
            }).length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-10 max-w-2xl mx-auto shadow-xl">
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Rozpocznij swoją przygodę
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
                    Wybierz jeden z polecanych kursów i zacznij naukę już teraz
                  </p>
                </div>
              </div>
            )}

            <div className="mt-16 text-center">
              <div
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-10 max-w-2xl mx-auto shadow-xl"
              >
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Nie wiesz od czego zacząć?
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
                  Polecamy zacząć od kursu Python - idealny dla osób, które
                  dopiero rozpoczynają swoją przygodę z programowaniem!
                </p>
                <button
                  onClick={() => onCourseSelect('course-python')}
                  className="px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Zacznij od Pythona
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-lg"
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                  Nauka przez praktykę
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pisz kod bezpośrednio w przeglądarce i zobacz efekty na żywo
                </p>
              </div>
              <div
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-lg"
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                  System XP i osiągnięć
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Zdobywaj punkty i odblokuj nowe wyzwania
                </p>
              </div>
              <div
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-lg"
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                  Utrzymuj streak
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ucz się codziennie i buduj swoją passę
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl text-black font-bold text-foreground dark:text-white dark:text-foreground-dark mb-6">
              Wszystkie dostępne kursy
            </h2>
            <CourseGrid
              courses={courses.filter((c) => c.isPublished)}
              onCourseSelect={onCourseSelect}
              getCourseProgress={getCourseProgress}
            />
          </div>
        )}
      </div>
    </div>
  )
}
