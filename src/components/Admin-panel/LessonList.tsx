import { Course, Lesson, Module } from '../../types/lesson'

interface LessonListProps {
  courses: Course[]
  loading: boolean
  onEdit: (lessonId: string) => void
  onDelete: (lessonId: string) => void
}

export default function LessonList({
  courses,
  loading,
  onEdit,
  onDelete,
}: LessonListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Ładowanie...</p>
      </div>
    )
  }

  const allLessons = courses.flatMap((course: Course) =>
    course.modules.flatMap((module: Module) =>
      module.lessons.map((lesson: Lesson) => ({
        lesson,
        courseName: course.title,
      }))
    )
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        Wszystkie lekcje
      </h2>
      <div className="space-y-2">
        {allLessons.map(({ lesson, courseName }) => (
          <div
            key={lesson.id}
            className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <span className="text-sm font-mono text-slate-500">
                {lesson.id}
              </span>
              <h4 className="font-semibold text-slate-800">{lesson.title}</h4>
              <p className="text-sm text-slate-600">
                {courseName} • {lesson.language} • {lesson.xp_reward} XP
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                onClick={() => onEdit(lesson.id)}
              >
                Edytuj
              </button>
              <button
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                onClick={() => onDelete(lesson.id)}
              >
                Usuń
              </button>
            </div>
          </div>
        ))}
        {allLessons.length === 0 && (
          <p className="text-center py-8 text-slate-500">
            Brak lekcji. Utwórz pierwszą lekcję w zakładce "Utwórz lekcję".
          </p>
        )}
      </div>
    </div>
  )
}
