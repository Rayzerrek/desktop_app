import { useState, useEffect } from 'react'
import { Course, Module } from '../types/lesson'
import { lessonService } from '../services/LessonService'
import { createExerciseContent } from '../utils/lessonHelpers'
import LessonEditDialog from './LessonEditDialog'
import AdminTabs, { AdminTabType } from './Admin-panel/AdminTabs'
import CourseList from './Admin-panel/CourseList'
import LessonList from './Admin-panel/LessonList'
import CourseForm, { NewCourseData } from './Admin-panel/CourseForm'
import ModuleForm, { NewModuleData } from './Admin-panel/ModuleForm'
import LessonForm, { NewLessonData } from './Admin-panel/LessonForm'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTabType>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)

  useEffect(() => {
    loadCourses()
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

  const handleCreateCourse = async (data: NewCourseData) => {
    try {
      const created = await lessonService.createCourse({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        language: data.language,
        color: data.color,
        order_index: 0,
        isPublished: true,
        estimatedHours: data.estimatedHours,
      })
      alert(`Kurs "${created.title}" utworzony!`)
      await loadCourses()
      setSelectedCourse(created)
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Error: ' + error)
    }
  }

  const handleCreateModule = async (data: NewModuleData) => {
    if (!selectedCourse) return

    try {
      const created = await lessonService.createModule({
        course_id: selectedCourse.id,
        title: data.title,
        description: data.description,
        orderIndex: selectedCourse.modules.length,
        iconEmoji: data.iconEmoji,
      })
      alert(`Moduł "${created.title}" utworzony!`)
      await loadCourses()
      setSelectedModule(created)
    } catch (error) {
      console.error('Error creating module:', error)
      alert('Error: ' + error)
    }
  }

  const handleCreateLesson = async (data: NewLessonData) => {
    if (!selectedModule) {
      alert("Najpierw wybierz moduł w zakładce 'Kursy'!")
      return
    }

    try {
      const lessonContent = createExerciseContent({
        instruction: data.instruction,
        starterCode: data.starterCode,
        solution: data.solution,
        hint: data.hint,
        expectedOutput: data.expectedOutput,
        exampleCode: data.exampleCode,
        exampleDescription: data.exampleDescription,
      })

      await lessonService.createLesson({
        module_id: selectedModule.id,
        title: data.title,
        description: data.description,
        lessonType: data.lessonType,
        content: lessonContent,
        language: data.language,
        xpReward: data.xpReward,
        orderIndex: 0,
        isLocked: false,
        estimatedMinutes: 15,
      })

      alert('Lekcja utworzona!')
      loadCourses()
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('Error: ' + error)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten kurs?')) return

    try {
      await lessonService.deleteCourse(courseId)
      alert('Kurs usunięty pomyślnie!')
      await loadCourses()
      setSelectedCourse(null)
      setSelectedModule(null)
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Błąd podczas usuwania kursu: ' + error)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę lekcję?')) return

    try {
      await lessonService.deleteLesson(lessonId)
      alert('Lekcja usunięta!')
      loadCourses()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Błąd: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">
              Panel Admina
            </h1>
            <p className="text-slate-600 text-lg">
              Zarządzaj kursami i lekcjami
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-full 
                       transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            Powrót
          </button>
        </div>

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div
          className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8"
          style={{
            boxShadow:
              '0 12px 48px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          {activeTab === 'courses' && (
            <CourseList
              courses={courses}
              loading={loading}
              selectedCourse={selectedCourse}
              selectedModule={selectedModule}
              onSelectCourse={setSelectedCourse}
              onSelectModule={setSelectedModule}
              onDeleteCourse={handleDeleteCourse}
              onAddLesson={() => setActiveTab('create')}
            />
          )}

          {activeTab === 'lessons' && (
            <LessonList
              courses={courses}
              loading={loading}
              onEdit={setEditingLessonId}
              onDelete={handleDeleteLesson}
            />
          )}

          {activeTab === 'create-course' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Utwórz nowy kurs i moduły
              </h2>

              <CourseForm onSubmit={handleCreateCourse} />

              {selectedCourse && (
                <ModuleForm
                  courseName={selectedCourse.title}
                  onSubmit={handleCreateModule}
                />
              )}

              {selectedModule && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Gotowe!
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Moduł "{selectedModule.title}" utworzony! Teraz możesz:
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('create')}
                      className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md"
                    >
                      Dodaj lekcję do tego modułu
                    </button>
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
                    >
                      Utwórz kolejny moduł
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <LessonForm
              selectedCourse={selectedCourse}
              selectedModule={selectedModule}
              onSubmit={handleCreateLesson}
              onChangeModule={() => {
                setSelectedModule(null)
                setActiveTab('courses')
              }}
            />
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {editingLessonId && (
        <LessonEditDialog
          isOpen={true}
          onClose={() => setEditingLessonId(null)}
          lessonId={editingLessonId}
          onSuccess={loadCourses}
        />
      )}
    </div>
  )
}
