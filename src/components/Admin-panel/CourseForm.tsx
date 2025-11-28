import { useState } from 'react'

interface NewCourseData {
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  color: string
  estimatedHours: number
}

interface CourseFormProps {
  onSubmit: (data: NewCourseData) => Promise<void>
}

export default function CourseForm({ onSubmit }: CourseFormProps) {
  const [newCourse, setNewCourse] = useState<NewCourseData>({
    title: '',
    description: '',
    difficulty: 'beginner',
    language: 'python',
    color: '#3B82F6',
    estimatedHours: 10,
  })

  const handleSubmit = async () => {
    await onSubmit(newCourse)
    setNewCourse({
      title: '',
      description: '',
      difficulty: 'beginner',
      language: 'python',
      color: '#3B82F6',
      estimatedHours: 10,
    })
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4">
        Krok 1: Utwórz kurs
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tytuł kursu *
            </label>
            <input
              type="text"
              value={newCourse.title}
              onChange={(e) =>
                setNewCourse({ ...newCourse, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 
                         focus:ring-0 focus:border-blue-500 outline-none
                         transition-all duration-200 bg-white hover:border-slate-300"
              placeholder="np. Python dla początkujących"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Język programowania *
            </label>
            <select
              value={newCourse.language}
              onChange={(e) =>
                setNewCourse({ ...newCourse, language: e.target.value })
              }
              aria-label='Jezyk programowania'
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Opis kursu
          </label>
          <textarea
            value={newCourse.description}
            onChange={(e) =>
              setNewCourse({ ...newCourse, description: e.target.value })
            }
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Krótki opis kursu"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Poziom trudności
            </label>
            <select
              value={newCourse.difficulty}
              aria-label='Poziom trudnosci'
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  difficulty: e.target.value as NewCourseData['difficulty'],
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="beginner">Początkujący</option>
              <option value="intermediate">Średniozaawansowany</option>
              <option value="advanced">Zaawansowany</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Szacowany czas (h)
            </label>
            <input
              type="number"
              value={newCourse.estimatedHours}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  estimatedHours: parseInt(e.target.value) || 0,
                })
              }
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kolor
            </label>
            <input
              type="color"
              value={newCourse.color}
              onChange={(e) =>
                setNewCourse({ ...newCourse, color: e.target.value })
              }
              className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!newCourse.title}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 
                     hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-300 
                     disabled:to-slate-300 text-white font-bold rounded-full 
                     transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
        >
          Utwórz kurs
        </button>
      </div>
    </div>
  )
}

export type { NewCourseData }

