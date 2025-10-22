import { useState, useEffect } from "react";
import AuthPanel from "./components/AuthPanel";
import LessonDemo from "./components/LessonDemo";
import CourseDashboard from "./components/CourseDashboard";
import AdminPanel from "./components/AdminPanel";
import CodePlayground from "./components/CodePlayground";
import Toast, { ToastType } from "./components/Toast";
import { lessonService } from "./services/LessonService";
import { useAuth } from "./hooks/useAuth";
import "./styles/App.css";

function App() {

   const {isAuthenticated, isAdmin, refreshAdmin, login, logout} = useAuth();
   const [currentView, setCurrentView] = useState<
      "auth" | "dashboard" | "lesson" | "admin" | "playground"
   >("auth");
   const [selectedCourseId, setSelectedCourseId] = useState<string>("");
   const [selectedLessonId, setSelectedLessonId] = useState<string>("");
   const [toast, setToast] = useState<{
      message: string;
      type: ToastType;
   } | null>(null);



   useEffect(() => {
      if (isAuthenticated) {
         refreshAdmin();
         if (currentView === "auth") {
            setCurrentView("dashboard");
         }
      }
   }, [isAuthenticated, refreshAdmin, currentView]);

   const handleCourseSelect = async (courseId: string) => {
      console.log("Selected course ID:", courseId);

      if (courseId === selectedCourseId) {
         setCurrentView("dashboard");
         return;
      }

      setSelectedCourseId(courseId);

      try {
         const courses = await lessonService.getCourses();
         const course = courses.find((c) => c.id === courseId);
         console.log("Found course:", course?.title);

         if (course && course.modules[0]?.lessons[0]) {
            const firstLessonId = course.modules[0].lessons[0].id;
            console.log("First lesson ID:", firstLessonId);
            setSelectedLessonId(firstLessonId);
            setCurrentView("lesson");
         } else {
            console.error("No lessons found in course!");
         }
      } catch (error) {
         console.error("Error loading course:", error);
         setToast({
            message: "Błąd ładowania kursu",
            type: "error"
         });
      }
   };

   const handleAdminAccess = () => {
      if (!isAuthenticated) {
         setToast({
            message:
               "Musisz być zalogowany aby uzyskać dostęp do panelu admina",
            type: "error",
         });
         return;
      }

      if (!isAdmin) {
         setToast({
            message: "Nie masz uprawnień administratora!",
            type: "error",
         });
         return;
      }

      setCurrentView("admin");
   };

   if (currentView === "admin") {
      if (!isAdmin) {
         setToast({
            message: "Brak dostępu! Przekierowuję...",
            type: "error",
         });
         setTimeout(() => setCurrentView("dashboard"), 1000);
         return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
               <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-800">
                     Brak dostępu
                  </h1>
                  <p className="text-slate-600 mt-2">
                     Tylko administratorzy mogą tutaj wejść
                  </p>
               </div>
            </div>
         );
      }
      return <AdminPanel onBack={() => setCurrentView("dashboard")} />;
   }

   if (currentView === "playground") {
      return <CodePlayground onBack={() => setCurrentView("dashboard")} />;
   }

   if (currentView === "lesson") {
      return (
         <div>
            <button
               onClick={() => {
                  setCurrentView("dashboard");
               }}
               className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg text-sm"
            >
               ← Powrót do kursów
            </button>
            <LessonDemo
               lessonId={selectedLessonId}
               onNextLesson={(nextLessonId) => {
                  console.log("App - Setting next lesson:", nextLessonId);
                  setSelectedLessonId(nextLessonId);
               }}
            />
         </div>
      );
   }

   if (isAuthenticated && currentView === "dashboard") {
      return (
         <div>
            {toast && (
               <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
               />
            )}
            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
               <button
                  onClick={() => {
                     logout();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-lg text-sm"
               >
                  Wyloguj
               </button>
               <button
                  onClick={() => setCurrentView("playground")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg text-sm"
               >
                  Code Playground
               </button>
            </div>
            {isAdmin && (
               <button
                  onClick={handleAdminAccess}
                  className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg text-sm flex items-center gap-2"
               >
                  Panel Admina
               </button>
            )}
            <CourseDashboard onCourseSelect={handleCourseSelect} />
         </div>
      );
   }

   return (
      <div>
         <button
            onClick={() => {
               localStorage.setItem("access_token", "dev_token_skip_auth");
               localStorage.setItem("user_id", "dev_user");
               login();
            }}
            className="fixed top-4 right-4 z-50 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg text-xs font-mono"
         >
            DEV: Skip to Dashboard
         </button>
         <AuthPanel onLoginSuccess={login} />
      </div>
   );
}

export default App;
