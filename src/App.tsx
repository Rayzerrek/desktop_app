import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import AuthPanel from "./components/AuthPanel";
import LessonDemo from "./components/LessonDemo";
import CourseDashboard from "./components/CourseDashboard";
import AdminPanel from "./components/AdminPanel";
import Toast, { ToastType } from "./components/Toast";
import { allCourses } from "./data/sampleLessons";
import "./App.css";

function App() {
   const [currentView, setCurrentView] = useState<
      "auth" | "dashboard" | "lesson" | "admin"
   >("auth");
   const [selectedCourseId, setSelectedCourseId] = useState<string>("");
   const [selectedLessonId, setSelectedLessonId] = useState<string>("");
   const [isAdmin, setIsAdmin] = useState<boolean>(false);
   const [toast, setToast] = useState<{
      message: string;
      type: ToastType;
   } | null>(null);

   const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      return !!token;
   };

   const checkAdminStatus = async () => {
      const token = localStorage.getItem("access_token");
      console.log("🔍 Checking admin status...");
      console.log("Token exists:", !!token);

      if (!token) {
         console.log("❌ No token found");
         setIsAdmin(false);
         return;
      }

      try {
         console.log("📞 Calling check_is_admin...");
         const isAdminUser = await invoke<boolean>("check_is_admin", {
            accessToken: token,
         });
         console.log("✅ Admin check result:", isAdminUser);
         setIsAdmin(isAdminUser);
      } catch (error) {
         console.error("❌ Failed to check admin status:", error);
         setIsAdmin(false);
      }
   };

   useEffect(() => {
      if (checkAuth()) {
         checkAdminStatus();
      }
   }, [currentView]);

   const handleCourseSelect = (courseId: string) => {
      console.log("Selected course ID:", courseId);
      setSelectedCourseId(courseId);

      const course = allCourses.find((c) => c.id === courseId);
      console.log("Found course:", course?.title);

      if (course && course.modules[0]?.lessons[0]) {
         const firstLessonId = course.modules[0].lessons[0].id;
         console.log("First lesson ID:", firstLessonId);
         setSelectedLessonId(firstLessonId);
      } else {
         console.error("No lessons found in course!");
      }

      setCurrentView("lesson");
   };

   const handleAdminAccess = () => {
      if (!checkAuth()) {
         setToast({
            message:
               "Musisz być zalogowany aby uzyskać dostęp do panelu admina",
            type: "error",
         });
         return;
      }

      if (!isAdmin) {
         setToast({
            message: "Nie masz uprawnień administratora! 🔒",
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
                     🔒 Brak dostępu
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

   if (currentView === "dashboard") {
      return (
         <div>
            {toast && (
               <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
               />
            )}
            <button
               onClick={() => {
                  setCurrentView("auth");
               }}
               className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg text-sm"
            >
               ← Powrót do logowania (DEV)
            </button>
            <button
               onClick={handleAdminAccess}
               className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg text-sm flex items-center gap-2"
               title={
                  isAdmin
                     ? "Masz dostęp admina"
                     : "Brak dostępu (tylko DEV test)"
               }
            >
               🔧 Panel Admina {!isAdmin && "(TEST)"}
            </button>
            <CourseDashboard onCourseSelect={handleCourseSelect} />
         </div>
      );
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

   if (checkAuth()) {
      return (
         <div>
            <button
               onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  localStorage.removeItem("user_id");
                  window.location.reload();
               }}
               className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-lg text-sm"
            >
               🚪 Wyloguj
            </button>
            <CourseDashboard onCourseSelect={handleCourseSelect} />
         </div>
      );
   }

   return (
      <div>
         <button
            onClick={() => setCurrentView("dashboard")}
            className="fixed top-4 right-4 z-50 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg text-xs font-mono"
         >
            🚀 DEV: Skip to Dashboard
         </button>
         <AuthPanel onLoginSuccess={() => setCurrentView("dashboard")} />
      </div>
   );
}

export default App;
