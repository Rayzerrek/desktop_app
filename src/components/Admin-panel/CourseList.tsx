import { Course, Module } from '../../types/lesson'

interface CourseListProps {
  courses: Course[]
  loading: boolean
  selectedCourse: Course | null
  selectedModule: Module | null
  onSelectCourse: (course: Course | null) => void
  onSelectModule: (module: Module | null) => void
  onDeleteCourse: (courseId: string) => void
  onAddLesson: () => void
}

export default function CourseList({
  courses,
  loading,
  selectedCourse,
  selectedModule,
  onSelectCourse,
  onSelectModule,
  onDeleteCourse,
  onAddLesson,
}: CourseListProps) {
  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 text-lg">Ładowanie...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Lista kursów</h2>
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl 
                       border border-slate-200 hover:shadow-xl transition-all duration-300"
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {course.modules.length} modułów •{' '}
                  {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}{' '}
                  lekcji
                </p>
              </div>
              <div className="flex items-end gap-3">
                <button
                  onClick={() => onDeleteCourse(course.id)}
                  className="px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white 
                             text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Usuń
                </button>
                <button
                  onClick={() => {
                    onSelectCourse(
                      selectedCourse?.id === course.id ? null : course
                    )
                    onSelectModule(null)
                  }}
                  className={`px-5 py-2.5 rounded-full transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg ${
                    selectedCourse?.id === course.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {selectedCourse?.id === course.id ? 'Wybrany' : 'Wybierz'}
                </button>
              </div>
            </div>

            {/* Modules List */}
            {selectedCourse?.id === course.id && (
              <div className="mt-4 space-y-2 pl-4 border-l-4 border-purple-300">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Moduły w tym kursie:
                </p>
                {course.modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                      selectedModule?.id === module.id
                        ? 'bg-green-100 border-green-400'
                        : 'bg-white border-slate-200 hover:border-green-300'
                    }`}
                    onClick={() =>
                      onSelectModule(
                        selectedModule?.id === module.id ? null : module
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">
                          {module.iconEmoji} {module.title}
                        </p>
                        <p className="text-sm text-slate-600">
                          {module.lessons.length} lekcji
                        </p>
                      </div>
                      {selectedModule?.id === module.id && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                            Wybrany
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddLesson()
                            }}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition"
                          >
                            Dodaj lekcję
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {course.modules.length === 0 && (
                  <p className="text-sm text-slate-500 italic">
                    Brak modułów. Utwórz pierwszy moduł w zakładce "Utwórz
                    kurs".
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
