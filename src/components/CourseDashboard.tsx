import { Course } from "../types/lesson";
import { lessonService } from "../services/LessonService";
import { progressService, UserProgress } from "../services/ProgressService";
import { JSX, useEffect, useState } from "react";
import { SiPython, SiJavascript, SiHtml5, SiCss3, SiTypescript} from "react-icons/si";
import { DiJava } from "react-icons/di";
import { countLessons } from "../utils/courseUtils";
import SearchBar from "./Searchbar";

interface CourseDashboardProps {
   onCourseSelect: (courseId: string) => void;
}

export default function CourseDashboard({
   onCourseSelect,
}: CourseDashboardProps) {
   const [courses, setCourses] = useState<Course[]>([]);
   const [loading, setLoading] = useState(true);
   const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

   useEffect(() => {
      loadCourses();
      loadProgress();
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

   const loadProgress = async () => {
      try {
         const userId = localStorage.getItem("user_id");
         if (userId) {
            const progress = await progressService.getUserProgress(userId);
            setUserProgress(progress);
         }
      } catch (error) {
         console.error("Error loading progress:", error);
      }
   };

   const getCourseProgress = (course: Course): number => {
      const lessonIds = course.modules.flatMap(module => 
         module.lessons.map(lesson => lesson.id)
      );
      return progressService.calculateCourseProgress(userProgress, lessonIds);
   };
   const getCourseIcon = (language: string): JSX.Element | null => {
      const courseIcons: Record<string, JSX.Element> = {
         python: <SiPython />,
         javascript: <SiJavascript />,
         html: <SiHtml5 />,
         css: <SiCss3 />,
         typescript: <SiTypescript />,
         java: <DiJava />,
      };
      return courseIcons[language] || null;
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

   if (loading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
               <p className="text-xl text-slate-600">Ładowanie kursów...</p>
            </div>
         </div>
      );
   }

   const handleSearchResultSelect = (result: { type: "course" | "lesson"; id: string }) => {
      if (result.type === "course") {
         onCourseSelect(result.id);
      } else {
         console.log("Selected lesson:", result.id);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
               <h1 className="text-6xl font-bold text-slate-900 mb-4 tracking-tight">
                  Wybierz swój kurs
               </h1>
               <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                  Rozpocznij swoją przygodę z programowaniem. Wybierz kurs i
                  zacznij naukę już teraz!
               </p>
               
               {/* Search Bar */}
               <div className="flex justify-center mb-6">
                  <SearchBar 
                     onResultSelect={handleSearchResultSelect}
                     placeholder="Szukaj kursów i lekcji..."
                     className="w-full max-w-2xl"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {courses.map((course: Course) => (
                  <div
                     key={course.id}
                     onClick={() => onCourseSelect(course.id)}
                     className="group bg-white rounded-3xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1"
                     style={{
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                     }}
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

                     <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                     </h3>

                     <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                        {course.description}
                     </p>

                     <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                           <span className="font-medium">
                              {countLessons(course)} lekcji
                           </span>
                        </div>
                        {course.estimatedHours && (
                           <div className="flex items-center gap-1">
                              <span className="font-medium">{course.estimatedHours}h</span>
                           </div>
                        )}
                     </div>

                     <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                        <div
                           className="h-2 rounded-full transition-all duration-500"
                           style={{
                              width: `${getCourseProgress(course)}%`,
                              backgroundColor: course.color,
                           }}
                        ></div>
                     </div>
                     
                     {getCourseProgress(course) > 0 && (
                        <p className="text-xs text-slate-500 mb-2 text-center">
                           Ukończono: {getCourseProgress(course)}%
                        </p>
                     )}

                     <button
                        className="w-full py-3 rounded-2xl font-bold transition-all duration-200 text-white shadow-md hover:shadow-xl"
                        style={{
                           background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`,
                        }}
                     >
                        Rozpocznij kurs
                     </button>
                  </div>
               ))}
            </div>

            <div className="mt-16 text-center">
               <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-2xl mx-auto"
                    style={{
                       boxShadow: '0 12px 48px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                     Nie wiesz od czego zacząć?
                  </h2>
                  <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                     Polecamy zacząć od kursu Python - idealny dla osób, które
                     dopiero rozpoczynają swoją przygodę z programowaniem!
                  </p>
                  <button
                     onClick={() => onCourseSelect("course-python")}
                     className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                     Zacznij od Pythona
                  </button>
               </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
               <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
                    style={{
                       boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)'
                    }}>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">
                     Nauka przez praktykę
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                     Pisz kod bezpośrednio w przeglądarce i zobacz efekty na
                     żywo
                  </p>
               </div>
               <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
                    style={{
                       boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)'
                    }}>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">
                     System XP i osiągnięć
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                     Zdobywaj punkty i odblokuj nowe wyzwania
                  </p>
               </div>
               <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
                    style={{
                       boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)'
                    }}>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">
                     Utrzymuj streak
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                     Ucz się codziennie i buduj swoją passę
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}
