import { Course } from '../types/lesson'

interface CourseGridProps {
  courses: Course[]
  onCourseSelect: (courseId: string) => void
  getCourseProgress?: (course: Course) => number
}

const difficultyLabel = (d: Course['difficulty']) => {
  switch (d) {
    case 'beginner':
      return 'Łatwy'
    case 'intermediate':
      return 'Średni'
    case 'advanced':
      return 'Zaawansowany'
    default:
      return d
  }
}

export default function CourseGrid({
  courses,
  onCourseSelect,
  getCourseProgress,
}: CourseGridProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center text-slate-600 dark:text-slate-400">
        Brak kursów do wyświetlenia.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const progress = getCourseProgress
          ? Math.round(getCourseProgress(course))
          : 0

        return (
          <div
            key={course.id}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer"
            onClick={() => onCourseSelect(course.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onCourseSelect(course.id)
            }}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: course.color || '#4f46e5' }}
                >
                  {course.iconUrl ? (
                    <img
                      src={course.iconUrl}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span>{course.title.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {difficultyLabel(course.difficulty)}
                  </span>
                  {course.estimatedHours && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {course.estimatedHours} lekcji.
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {course.modules?.length ?? 0} modułów
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 bg-gradient-to-r from-blue-500 to-indigo-600`}
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                  {progress}% ukończono
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
