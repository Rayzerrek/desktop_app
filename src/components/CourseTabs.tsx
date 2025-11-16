import { useState, useEffect } from 'react'
import { Course } from '../types/lesson'
import { lessonService } from '../services/LessonService'
import { progressService, UserProgress } from '../services/ProgressService'
import CourseGrid from './CourseGrid'
import SearchBar from './Searchbar'
import Button from './ui/Button'

interface CourseTabsProps {
  onCourseSelect: (courseId: string) => void
}

export default function CourseTabs({ onCourseSelect }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'all'>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coursesData, progressData] = await Promise.all([
        lessonService.getCourses(),
        loadProgress(),
      ])
      setCourses(coursesData)
      setUserProgress(progressData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async (): Promise<UserProgress[]> => {
    try {
      const userId = localStorage.getItem('user_id')
      if (userId) {
        return await progressService.getUserProgress(userId)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
    return []
  }

  const getCourseProgress = (course: Course): number => {
    const lessonIds = course.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
    )
    return progressService.calculateCourseProgress(userProgress, lessonIds)
  }

  const getStartedCourses = (): Course[] => {
    return courses.filter((course) => {
      const progress = getCourseProgress(course)
      return progress > 0 && progress < 100
    })
  }

  const getRecommendedCourses = (): Course[] => {
    const started = getStartedCourses()
    const startedIds = new Set(started.map((c) => c.id))

    return courses
      .filter(
        (course) =>
          !startedIds.has(course.id) &&
          course.isPublished &&
          getCourseProgress(course) < 100
      )
      .slice(0, 3)
  }

  const handleSearchResultSelect = (result: {
    type: 'course' | 'lesson'
    id: string
  }) => {
    if (result.type === 'course') {
      onCourseSelect(result.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">Ładowanie kursów...</p>
        </div>
      </div>
    )
  }

  const startedCourses = getStartedCourses()
  const recommendedCourses = getRecommendedCourses()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-slate-900 mb-4 tracking-tight">
            Twoje Kursy
          </h1>
          <div className="flex justify-center mb-6">
            <SearchBar
              onResultSelect={handleSearchResultSelect}
              placeholder="Szukaj kursów i lekcji..."
              className="w-full max-w-2xl"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-8 bg-white rounded-2xl p-2 shadow-lg w-full">
          <Button
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            className={activeTab === 'overview' ? '' : '!bg-transparent !text-slate-600 hover:!text-slate-800 hover:!bg-slate-50 !shadow-none'}
          >
            Przegląd
          </Button>
          <Button
            onClick={() => setActiveTab('all')}
            variant={activeTab === 'all' ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            className={activeTab === 'all' ? '' : '!bg-transparent !text-slate-600 hover:!text-slate-800 hover:!bg-slate-50 !shadow-none'}
          >
            Wszystkie kursy
          </Button>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-12">
            {startedCourses.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Kontynuuj naukę
                </h2>
                <CourseGrid
                  courses={startedCourses}
                  onCourseSelect={onCourseSelect}
                  getCourseProgress={getCourseProgress}
                />
              </section>
            )}

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Polecane dla Ciebie
              </h2>
              <CourseGrid
                courses={recommendedCourses}
                onCourseSelect={onCourseSelect}
                getCourseProgress={getCourseProgress}
              />
            </section>

            {startedCourses.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-2xl mx-auto">
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    Rozpocznij swoją przygodę
                  </h3>
                  <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                    Wybierz jeden z polecanych kursów i zacznij naukę już teraz
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
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
