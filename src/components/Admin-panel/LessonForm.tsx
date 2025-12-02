import { useState } from 'react'
import { Course, Module, QuizOption } from '../../types/lesson'

type LessonLanguage = 'python' | 'javascript' | 'html' | 'css' | 'typescript'
type LessonType = 'exercise' | 'theory' | 'quiz' | 'project'

interface NewLessonData {
  title: string
  description: string
  language: LessonLanguage
  lessonType: LessonType
  xpReward: number
  instruction: string
  starterCode: string
  solution: string
  hint: string
  expectedOutput: string
  exampleCode: string
  exampleDescription: string
  // Quiz fields
  quizQuestion?: string
  quizOptions?: QuizOption[]
  quizExplanation?: string
}

interface LessonFormProps {
  selectedCourse: Course | null
  selectedModule: Module | null
  onSubmit: (data: NewLessonData) => Promise<void>
  onChangeModule: () => void
}

const initialLessonState: NewLessonData = {
  title: '',
  description: '',
  language: 'python',
  lessonType: 'exercise',
  xpReward: 10,
  instruction: '',
  starterCode: '# Kod który użytkownik zobaczy na starcie',
  solution: '',
  hint: '',
  expectedOutput: '',
  exampleCode: '',
  exampleDescription: '',
  quizQuestion: '',
  quizOptions: [],
  quizExplanation: '',
}

export default function LessonForm({
  selectedCourse,
  selectedModule,
  onSubmit,
  onChangeModule,
}: LessonFormProps) {
  const [newLesson, setNewLesson] = useState<NewLessonData>(initialLessonState)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(newLesson)
    setNewLesson(initialLessonState)
  }

  if (!selectedModule) {
    return (
      <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠</span>
          <h3 className="text-lg font-bold text-yellow-800">
            Najpierw wybierz moduł
          </h3>
        </div>
        <p className="text-yellow-700 mb-4">
          Aby utworzyć lekcję, musisz najpierw wybrać kurs i moduł, do którego
          ma należeć lekcja.
        </p>
        <button
          onClick={onChangeModule}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition shadow-md"
        >
          Przejdź do wyboru kursu i modułu
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Utwórz nową lekcję
      </h2>

      {/* Module Selection Info */}
      <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700">Dodajesz lekcję do:</p>
            <p className="text-lg font-bold text-green-800">
              {selectedModule.iconEmoji} {selectedModule.title}
            </p>
            {selectedCourse && (
              <p className="text-sm text-green-600">
                z kursu: {selectedCourse.title}
              </p>
            )}
          </div>
          <button
            onClick={onChangeModule}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
          >
            Zmień moduł
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tytuł lekcji *
            </label>
            <input
              type="text"
              value={newLesson.title}
              onChange={(e) =>
                setNewLesson({ ...newLesson, title: e.target.value })
              }
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="np. Twój pierwszy program w Pythonie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Język programowania *
            </label>
            <select
              value={newLesson.language}
              onChange={(e) =>
                setNewLesson({
                  ...newLesson,
                  language: e.target.value as LessonLanguage,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Opis
          </label>
          <input
            type="text"
            value={newLesson.description}
            onChange={(e) =>
              setNewLesson({ ...newLesson, description: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Krótki opis lekcji"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Typ lekcji *
            </label>
            <select
              value={newLesson.lessonType}
              onChange={(e) =>
                setNewLesson({
                  ...newLesson,
                  lessonType: e.target.value as LessonType,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="exercise">Ćwiczenie</option>
              <option value="theory">Teoria</option>
              <option value="quiz">Quiz</option>
              <option value="project">Projekt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nagroda XP *
            </label>
            <input
              type="number"
              value={newLesson.xpReward}
              onChange={(e) =>
                setNewLesson({
                  ...newLesson,
                  xpReward: parseInt(e.target.value) || 0,
                })
              }
              min="5"
              step="5"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Exercise-specific fields */}
        {newLesson.lessonType === 'exercise' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instrukcja zadania *
              </label>
              <textarea
                value={newLesson.instruction}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, instruction: e.target.value })
                }
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                placeholder="np. Napisz kod który wyświetli 'Hello World'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kod startowy
              </label>
              <textarea
                value={newLesson.starterCode}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, starterCode: e.target.value })
                }
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm resize-none"
                placeholder="# Kod który użytkownik zobaczy na starcie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rozwiązanie *
              </label>
              <textarea
                value={newLesson.solution}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, solution: e.target.value })
                }
                required
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm resize-none"
                placeholder="print('Hello World')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Przykładowy kod
              </label>
              <textarea
                value={newLesson.exampleCode}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, exampleCode: e.target.value })
                }
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm resize-none"
                placeholder="# Przykładowy kod do wyświetlenia uczniowi jako odniesienie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Opis przykładowego kodu
              </label>
              <input
                type="text"
                value={newLesson.exampleDescription}
                onChange={(e) =>
                  setNewLesson({
                    ...newLesson,
                    exampleDescription: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="np. 'Zobacz jak używa się funkcji print()'"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Wskazówka
                </label>
                <input
                  type="text"
                  value={newLesson.hint}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, hint: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Użyj funkcji print()"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Oczekiwany wynik *
                </label>
                <input
                  type="text"
                  value={newLesson.expectedOutput}
                  onChange={(e) =>
                    setNewLesson({
                      ...newLesson,
                      expectedOutput: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Hello World"
                />
              </div>
            </div>
          </>
          )}

          {/* Quiz-specific fields */}
          {newLesson.lessonType === 'quiz' && (
          <>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">
               Pytanie *
             </label>
             <textarea
               value={newLesson.quizQuestion || ''}
               onChange={(e) =>
                 setNewLesson({ ...newLesson, quizQuestion: e.target.value })
               }
               required
               rows={2}
               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
               placeholder="Wpisz pytanie quizowe..."
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">
               Opcje odpowiedzi *
             </label>
             <div className="space-y-3">
               {newLesson.quizOptions?.map((option, idx) => (
                 <div key={idx} className="flex gap-3 items-start">
                   <div className="flex-1 space-y-2">
                     <input
                       type="text"
                       value={option.text}
                       onChange={(e) => {
                         const newOptions = [...(newLesson.quizOptions || [])]
                         newOptions[idx] = { ...newOptions[idx], text: e.target.value }
                         setNewLesson({ ...newLesson, quizOptions: newOptions })
                       }}
                       className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                       placeholder="Tekst odpowiedzi"
                       required
                     />
                     {option.explanation && (
                       <input
                         type="text"
                         value={option.explanation}
                         onChange={(e) => {
                           const newOptions = [...(newLesson.quizOptions || [])]
                           newOptions[idx] = {
                             ...newOptions[idx],
                             explanation: e.target.value,
                           }
                           setNewLesson({ ...newLesson, quizOptions: newOptions })
                         }}
                         className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                         placeholder="Wyjaśnienie (opcjonalne)"
                       />
                     )}
                   </div>
                   <div className="flex items-center gap-2 pt-2">
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input
                         type="checkbox"
                         checked={option.isCorrect}
                         onChange={(e) => {
                           const newOptions = [...(newLesson.quizOptions || [])]
                           newOptions[idx] = {
                             ...newOptions[idx],
                             isCorrect: e.target.checked,
                           }
                           setNewLesson({ ...newLesson, quizOptions: newOptions })
                         }}
                         className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                       />
                       <span className="text-xs font-medium text-slate-600">
                         Poprawna
                       </span>
                     </label>
                     <button
                       type="button"
                       onClick={() => {
                         const newOptions = (newLesson.quizOptions || []).filter(
                           (_, i) => i !== idx
                         )
                         setNewLesson({ ...newLesson, quizOptions: newOptions })
                       }}
                       className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                     >
                       Usuń
                     </button>
                   </div>
                 </div>
               ))}
             </div>
             <button
               type="button"
               onClick={() => {
                 setNewLesson({
                   ...newLesson,
                   quizOptions: [
                     ...(newLesson.quizOptions || []),
                     { text: '', isCorrect: false, explanation: '' },
                   ],
                 })
               }}
               className="mt-3 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition text-sm"
             >
               + Dodaj opcję
             </button>
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">
               Ogólne wyjaśnienie (opcjonalne)
             </label>
             <textarea
               value={newLesson.quizExplanation || ''}
               onChange={(e) =>
                 setNewLesson({ ...newLesson, quizExplanation: e.target.value })
               }
               rows={2}
               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
               placeholder="Wyjaśnienie pokazane po odpowiedzeniu..."
             />
           </div>
          </>
          )}

          {/* Action buttons */}
        <div className="flex gap-4 pt-6 border-t border-slate-200">
          <button
            type="submit"
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 
                       hover:from-purple-700 hover:to-indigo-700 text-white font-bold 
                       rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Utwórz lekcję
          </button>
          <button
            type="button"
            onClick={onChangeModule}
            className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 
                       font-semibold rounded-full transition-all duration-200"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  )
}

export type { NewLessonData }
