import { useState } from "react";
import { Course, Module, Lesson, ExerciseLesson } from "../types/lesson";
import { allCourses } from "../data/sampleLessons";

interface AdminPanelProps {
   onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
   const [activeTab, setActiveTab] = useState<"courses" | "lessons" | "create">(
      "courses",
   );
   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
   const [isCreatingLesson, setIsCreatingLesson] = useState(false);

   const [newLesson, setNewLesson] = useState({
      title: "",
      description: "",
      language: "python" as
         | "python"
         | "javascript"
         | "html"
         | "css"
         | "typescript",
      lessonType: "exercise" as "exercise" | "theory" | "quiz" | "project",
      xpReward: 10,
      instruction: "",
      starterCode: "",
      solution: "",
      hint: "",
      expectedOutput: "",
   });

   const handleCreateLesson = () => {
      console.log("Creating lesson:", newLesson);
      alert("Lekcja utworzona! (w przyszłości zapisze się do bazy)");
      setIsCreatingLesson(false);
      setNewLesson({
         title: "",
         description: "",
         language: "python",
         lessonType: "exercise",
         xpReward: 10,
         instruction: "",
         starterCode: "",
         solution: "",
         hint: "",
         expectedOutput: "",
      });
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
         <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">
                     🔧 Panel Admina
                  </h1>
                  <p className="text-slate-600">Zarządzaj kursami i lekcjami</p>
               </div>
               <button
                  onClick={onBack}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition shadow-md"
               >
                  ← Powrót
               </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-white/20">
               <button
                  onClick={() => setActiveTab("courses")}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                     activeTab === "courses"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                  }`}
               >
                  📚 Kursy
               </button>
               <button
                  onClick={() => setActiveTab("lessons")}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                     activeTab === "lessons"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                  }`}
               >
                  📝 Lekcje
               </button>
               <button
                  onClick={() => {
                     setActiveTab("create");
                     setIsCreatingLesson(true);
                  }}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                     activeTab === "create"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                  }`}
               >
                  ➕ Utwórz lekcję
               </button>
            </div>

            {/* Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
               {activeTab === "courses" && (
                  <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        Lista kursów
                     </h2>
                     <div className="space-y-4">
                        {allCourses.map((course) => (
                           <div
                              key={course.id}
                              className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition"
                           >
                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-xl font-semibold text-slate-800">
                                       {course.title}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                       {course.modules.length} modułów •{" "}
                                       {course.modules.reduce(
                                          (acc, m) => acc + m.lessons.length,
                                          0,
                                       )}{" "}
                                       lekcji
                                    </p>
                                 </div>
                                 <div className="flex gap-2">
                                    <button
                                       onClick={() => setSelectedCourse(course)}
                                       className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                                    >
                                       Szczegóły
                                    </button>
                                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm">
                                       Edytuj
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === "lessons" && (
                  <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        Wszystkie lekcje
                     </h2>
                     <div className="space-y-2">
                        {allCourses.flatMap((course) =>
                           course.modules.flatMap((module) =>
                              module.lessons.map((lesson) => (
                                 <div
                                    key={lesson.id}
                                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between hover:shadow-md transition"
                                 >
                                    <div>
                                       <span className="text-sm font-mono text-slate-500">
                                          {lesson.id}
                                       </span>
                                       <h4 className="font-semibold text-slate-800">
                                          {lesson.title}
                                       </h4>
                                       <p className="text-sm text-slate-600">
                                          {course.title} • {lesson.language} •{" "}
                                          {lesson.xpReward} XP
                                       </p>
                                    </div>
                                    <div className="flex gap-2">
                                       <button className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm">
                                          Edytuj
                                       </button>
                                       <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
                                          Usuń
                                       </button>
                                    </div>
                                 </div>
                              )),
                           ),
                        )}
                     </div>
                  </div>
               )}

               {activeTab === "create" && isCreatingLesson && (
                  <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-6">
                        Utwórz nową lekcję
                     </h2>
                     <form
                        onSubmit={(e) => {
                           e.preventDefault();
                           handleCreateLesson();
                        }}
                        className="space-y-6"
                     >
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
                                    setNewLesson({
                                       ...newLesson,
                                       title: e.target.value,
                                    })
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
                                       language: e.target.value as any,
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
                                 setNewLesson({
                                    ...newLesson,
                                    description: e.target.value,
                                 })
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
                                       lessonType: e.target.value as any,
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
                                       xpReward: parseInt(e.target.value),
                                    })
                                 }
                                 min="5"
                                 step="5"
                                 className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                              />
                           </div>
                        </div>

                        {/* Exercise-specific fields */}
                        {newLesson.lessonType === "exercise" && (
                           <>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Instrukcja zadania *
                                 </label>
                                 <textarea
                                    value={newLesson.instruction}
                                    onChange={(e) =>
                                       setNewLesson({
                                          ...newLesson,
                                          instruction: e.target.value,
                                       })
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
                                       setNewLesson({
                                          ...newLesson,
                                          starterCode: e.target.value,
                                       })
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
                                       setNewLesson({
                                          ...newLesson,
                                          solution: e.target.value,
                                       })
                                    }
                                    required
                                    rows={5}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm resize-none"
                                    placeholder="print('Hello World')"
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
                                          setNewLesson({
                                             ...newLesson,
                                             hint: e.target.value,
                                          })
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

                        {/* Action buttons */}
                        <div className="flex gap-4 pt-4 border-t border-slate-200">
                           <button
                              type="submit"
                              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                           >
                              ✅ Utwórz lekcję
                           </button>
                           <button
                              type="button"
                              onClick={() => setIsCreatingLesson(false)}
                              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
                           >
                              Anuluj
                           </button>
                        </div>
                     </form>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
