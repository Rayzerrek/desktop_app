import { allCourses } from "../data/sampleLessons";
import { Course } from "../types/lesson";

interface CourseDashboardProps {
   onCourseSelect: (courseId: string) => void;
}

export default function CourseDashboard({
   onCourseSelect,
}: CourseDashboardProps) {
   const getCourseIcon = (language: string) => {
      const icons: Record<string, string> = {
         python: "🐍",
         javascript: "📜",
         html: "🌐",
         css: "🎨",
         typescript: "📘",
      };
      return icons[language] || "📚";
   };

   const getDifficultyColor = (difficulty: string) => {
      const colors: Record<string, string> = {
         beginner: "bg-green-100 text-green-700 border-green-200",
         intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
         advanced: "bg-red-100 text-red-700 border-red-200",
      };
      return colors[difficulty] || colors.beginner;
   };

   const getDifficultyLabel = (difficulty: string) => {
      const labels: Record<string, string> = {
         beginner: "Początkujący",
         intermediate: "Średniozaawansowany",
         advanced: "Zaawansowany",
      };
      return labels[difficulty] || difficulty;
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
               <h1 className="text-5xl font-bold text-slate-800 mb-4">
                  Wybierz swój kurs
               </h1>
               <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Rozpocznij swoją przygodę z programowaniem. Wybierz kurs i
                  zacznij naukę już teraz!
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {allCourses.map((course: Course) => (
                  <div
                     key={course.id}
                     onClick={() => onCourseSelect(course.id)}
                     className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1"
                  >
                     <div className="flex items-start justify-between mb-4">
                        <div
                           className="text-6xl transform group-hover:scale-110 transition-transform duration-300"
                           style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
                        >
                           {getCourseIcon(course.language)}
                        </div>
                        <span
                           className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                              course.difficulty
                           )}`}
                        >
                           {getDifficultyLabel(course.difficulty)}
                        </span>
                     </div>

                     <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                     </h3>

                     <p className="text-slate-600 mb-4 line-clamp-2">
                        {course.description}
                     </p>

                     <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                           <span>📚</span>
                           <span>
                              {course.modules.reduce(
                                 (acc, module) => acc + module.lessons.length,
                                 0
                              )}{" "}
                              lekcji
                           </span>
                        </div>
                        {course.estimatedHours && (
                           <div className="flex items-center gap-1">
                              <span>⏱️</span>
                              <span>{course.estimatedHours}h</span>
                           </div>
                        )}
                     </div>

                     <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                        <div
                           className="h-2 rounded-full transition-all duration-500"
                           style={{
                              width: "0%",
                              backgroundColor: course.color,
                           }}
                        ></div>
                     </div>

                     <button
                        className="w-full py-3 rounded-lg font-semibold transition-all duration-200 text-white shadow-md hover:shadow-lg"
                        style={{
                           background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`,
                        }}
                     >
                        Rozpocznij kurs →
                     </button>
                  </div>
               ))}
            </div>

            <div className="mt-16 text-center">
               <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">
                     🎯 Nie wiesz od czego zacząć?
                  </h2>
                  <p className="text-slate-600 mb-6">
                     Polecamy zacząć od kursu Python - idealny dla osób, które
                     dopiero rozpoczynają swoją przygodę z programowaniem!
                  </p>
                  <button
                     onClick={() => onCourseSelect("course-python")}
                     className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                     Zacznij od Pythona
                  </button>
               </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-4xl mb-3">🎓</div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                     Nauka przez praktykę
                  </h3>
                  <p className="text-sm text-slate-600">
                     Pisz kod bezpośrednio w przeglądarce i zobacz efekty na
                     żywo
                  </p>
               </div>
               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-4xl mb-3">⭐</div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                     System XP i osiągnięć
                  </h3>
                  <p className="text-sm text-slate-600">
                     Zdobywaj punkty i odblokuj nowe wyzwania
                  </p>
               </div>
               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-4xl mb-3">🔥</div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                     Utrzymuj streak
                  </h3>
                  <p className="text-sm text-slate-600">
                     Ucz się codziennie i buduj swoją passę
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}
