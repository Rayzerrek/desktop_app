import { useState, useEffect } from "react";
import { Course, Module, Lesson } from "../types/lesson";
import { lessonService } from "../services/LessonService";
import { createExerciseContent } from "../utils/lessonHelpers";

interface AdminPanelProps {
   onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
   const [activeTab, setActiveTab] = useState<"courses" | "lessons" | "create" | "create-course">(
      "courses",
   );
   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
   const [selectedModule, setSelectedModule] = useState<Module | null>(null);
   const [courses, setCourses] = useState<Course[]>([]);
   const [loading, setLoading] = useState(true);

   const [newCourse, setNewCourse] = useState({
      title: "",
      description: "",
      difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
      language: "python",
      color: "#3B82F6",
      estimatedHours: 10,
   });

   const [newModule, setNewModule] = useState({
      title: "",
      description: "",
      iconEmoji: "📚",
   });

   useEffect(() => {
      loadCourses();
   }, []);

   const loadCourses = async () => {
      try {
         const data = await lessonService.getCourses();
         setCourses(data);
      } catch (error) {
         console.error("Error loading courses:", error);
      } finally {
         setLoading(false);
      }
   };

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

   const handleCreateLesson = async () => {
      if (!selectedModule) {
         alert("Najpierw wybierz moduł w zakładce 'Kursy'!");
         return;
      }

      try {

         const lessonContent = createExerciseContent({
            instruction: newLesson.instruction,
            starterCode: newLesson.starterCode,
            solution: newLesson.solution,
            hint: newLesson.hint,
            expectedOutput: newLesson.expectedOutput
         });

         await lessonService.createLesson({
            module_id: selectedModule.id,
            title: newLesson.title,
            description: newLesson.description,
            lessonType: newLesson.lessonType,
            content: lessonContent,
            language: newLesson.language,
            xpReward: newLesson.xpReward,
            orderIndex: 0,
            isLocked: false,
            estimatedMinutes: 15
         });

         alert("Lekcja utworzona!");

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

         loadCourses();
      } catch (error) {
         console.error("Error creating lesson:", error);
         alert("Error: " + error);
      }
   };

   const handleCreateCourse = async () => {
      try {
         const created = await lessonService.createCourse({
            title: newCourse.title,
            description: newCourse.description,
            difficulty: newCourse.difficulty,
            language: newCourse.language,
            color: newCourse.color,
            order_index: 0,
            isPublished: true,
            estimatedHours: newCourse.estimatedHours,
         });

         alert(`Kurs "${created.title}" utworzony!`);
         setNewCourse({
            title: "",
            description: "",
            difficulty: "beginner",
            language: "python",
            color: "#3B82F6",
            estimatedHours: 10,
         });

         await loadCourses();
         setSelectedCourse(created);
      } catch (error) {
         console.error("Error creating course:", error);
         alert("Error: " + error);
      }
   };

   const handleCreateModule = async () => {
      if (!selectedCourse) {
         alert("Najpierw wybierz kurs!");
         return;
      }

      try {
         const created = await lessonService.createModule({
            course_id: selectedCourse.id,
            title: newModule.title,
            description: newModule.description,
            orderIndex: selectedCourse.modules.length,
            iconEmoji: newModule.iconEmoji,
         });

         alert(`Moduł "${created.title}" utworzony!`);
         setNewModule({
            title: "",
            description: "",
            iconEmoji: "📚",
         });

         await loadCourses();
         setSelectedModule(created);
      } catch (error) {
         console.error("Error creating module:", error);
         alert("Error: " + error);
      }
   };
   const handleDeleteCourse = async (courseId: string) => {
      try {
         await lessonService.deleteCourse(courseId);
         alert("Kurs usunięty pomyślnie!");
         await loadCourses(); // Przeładuj listę kursów
         setSelectedCourse(null); // Wyczyść wybrany kurs
         setSelectedModule(null); // Wyczyść wybrany moduł
      } catch (error) {
         console.error("Error deleting course:", error);
         alert("Błąd podczas usuwania kursu: " + error);
      }
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
         <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">
                     Panel Admina
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
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === "courses"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                     }`}
               >
                  Kursy
               </button>
               <button
                  onClick={() => setActiveTab("create-course")}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === "create-course"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                     }`}
               >
                  Utwórz kurs
               </button>
               <button
                  onClick={() => setActiveTab("lessons")}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === "lessons"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                     }`}
               >
                  Wszystkie lekcje
               </button>
               <button
                  onClick={() => setActiveTab("create")}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === "create"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                     }`}
               >
                  Utwórz lekcję
               </button>
            </div>

            {/* Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
               {activeTab === "courses" && (
                  <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        Lista kursów
                     </h2>
                     {loading ? (
                        <div className="text-center py-12">
                           <div className="text-4xl mb-4 animate-spin">⏳</div>
                           <p className="text-slate-600">Ładowanie...</p>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {courses.map((course: Course) => (
                              <div
                                 key={course.id}
                                 className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:shadow-md transition"
                              >
                                 <div className="flex items-center justify-between mb-3">
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
                                    <div className="flex items-end gap-3">
                                       <button
                                          onClick={() => {handleDeleteCourse(course.id)}}
                                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
                                       >
                                          Usuń
                                       </button>
                                       <button
                                          onClick={() => {
                                             setSelectedCourse(selectedCourse?.id === course.id ? null : course);
                                             setSelectedModule(null);
                                          }}
                                          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${selectedCourse?.id === course.id
                                                ? "bg-purple-500 text-white"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                             }`}
                                       >
                                          {selectedCourse?.id === course.id ? "✓ Wybrany" : "Wybierz"}
                                       </button>
                                    </div>


                                 </div>

                                 {/* Modules List */}
                                 {selectedCourse?.id === course.id && (
                                    <div className="mt-4 space-y-2 pl-4 border-l-4 border-purple-300">
                                       <p className="text-sm font-medium text-slate-700 mb-2">
                                          📦 Moduły w tym kursie:
                                       </p>
                                       {course.modules.map((module: Module) => (
                                          <div
                                             key={module.id}
                                             className={`p-3 rounded-lg border-2 transition cursor-pointer ${selectedModule?.id === module.id
                                                   ? "bg-green-100 border-green-400"
                                                   : "bg-white border-slate-200 hover:border-green-300"
                                                }`}
                                             onClick={() => setSelectedModule(
                                                selectedModule?.id === module.id ? null : module
                                             )}
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
                                                            e.stopPropagation();
                                                            setActiveTab("create");
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
                                             Brak modułów. Utwórz pierwszy moduł w zakładce "Utwórz kurs".
                                          </p>
                                       )}
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {activeTab === "lessons" && (
                  <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        Wszystkie lekcje
                     </h2>
                     {loading ? (
                        <div className="text-center py-12">
                           <div className="text-4xl mb-4 animate-spin">⏳</div>
                           <p className="text-slate-600">Ładowanie...</p>
                        </div>
                     ) : (
                        <div className="space-y-2">
                           {courses.flatMap((course: Course) =>
                              course.modules.flatMap((module: Module) =>
                                 module.lessons.map((lesson: Lesson) => (
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
                                             {lesson.xp_reward} XP
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
                     )}
                  </div>
               )}

               {activeTab === "create-course" && (
                  <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-6">
                        Utwórz nowy kurs i moduły
                     </h2>

                     {/* Create Course Section */}
                     <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">
                           Krok 1: Utwórz kurs
                        </h3>

                        <div className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tytuł kursu *
                                 </label>
                                 <input
                                    type="text"
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="np. Python dla początkujących"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Język programowania *
                                 </label>
                                 <select
                                    value={newCourse.language}
                                    onChange={(e) => setNewCourse({ ...newCourse, language: e.target.value })}
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
                                 onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
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
                                    onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value as any })}
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
                                    onChange={(e) => setNewCourse({ ...newCourse, estimatedHours: parseInt(e.target.value) })}
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
                                    onChange={(e) => setNewCourse({ ...newCourse, color: e.target.value })}
                                    className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                                 />
                              </div>
                           </div>

                           <button
                              onClick={handleCreateCourse}
                              disabled={!newCourse.title}
                              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition shadow-md"
                           >
                              Utwórz kurs
                           </button>
                        </div>
                     </div>

                     {/* Create Module Section */}
                     {selectedCourse && (
                        <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
                           <h3 className="text-xl font-bold text-slate-800 mb-2">
                              Krok 2: Dodaj moduł do kursu "{selectedCourse.title}"
                           </h3>
                           <p className="text-sm text-slate-600 mb-4">
                              Moduły to sekcje w kursie. Każdy moduł zawiera lekcje.
                           </p>

                           <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                       Tytuł modułu *
                                    </label>
                                    <input
                                       type="text"
                                       value={newModule.title}
                                       onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                       className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                                       placeholder="np. Podstawy składni"
                                    />
                                 </div>

                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                       Ikona emoji
                                    </label>
                                    <input
                                       type="text"
                                       value={newModule.iconEmoji}
                                       onChange={(e) => setNewModule({ ...newModule, iconEmoji: e.target.value })}
                                       maxLength={2}
                                       className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-2xl text-center"
                                       placeholder="📚"
                                    />
                                 </div>
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Opis modułu
                                 </label>
                                 <input
                                    type="text"
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="Co zawiera ten moduł?"
                                 />
                              </div>

                              <button
                                 onClick={handleCreateModule}
                                 disabled={!newModule.title}
                                 className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition shadow-md"
                              >
                                 Dodaj moduł
                              </button>
                           </div>
                        </div>
                     )}

                     {/* Next Steps */}
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
                                 onClick={() => setActiveTab("create")}
                                 className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md"
                              >
                                 Dodaj lekcję do tego modułu
                              </button>
                              <button
                                 onClick={() => {
                                    setSelectedModule(null);
                                 }}
                                 className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
                              >
                                 Utwórz kolejny moduł
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === "create" && (
                  <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-6">
                        Utwórz nową lekcję
                     </h2>

                     {/* Module Selection Info */}
                     {!selectedModule ? (
                        <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                           <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl">⚠</span>
                              <h3 className="text-lg font-bold text-yellow-800">
                                 Najpierw wybierz moduł
                              </h3>
                           </div>
                           <p className="text-yellow-700 mb-4">
                              Aby utworzyć lekcję, musisz najpierw wybrać kurs i moduł, do którego ma należeć lekcja.
                           </p>
                           <button
                              onClick={() => setActiveTab("courses")}
                              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition shadow-md"
                           >
                              Przejdź do wyboru kursu i modułu
                           </button>
                        </div>
                     ) : (
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
                                 onClick={() => {
                                    setSelectedModule(null);
                                    setActiveTab("courses");
                                 }}
                                 className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                              >
                                 Zmień moduł
                              </button>
                           </div>
                        </div>
                     )}

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
                              Utwórz lekcję
                           </button>
                           <button
                              type="button"
                              onClick={() => setActiveTab("courses")}
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
