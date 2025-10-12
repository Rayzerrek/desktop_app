import { useState } from "react";
import AuthPanel from "./components/AuthPanel";
import LessonDemo from "./components/LessonDemo";
import "./App.css";

function App() {
   const [currentView, setCurrentView] = useState<"auth" | "lesson">("auth");

   const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      return !!token;
   };

   if (currentView === "lesson") {
      return (
         <div>
            <button
               onClick={() => {
                  setCurrentView("auth");
               }}
               className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg text-sm"
            >
               ← Powrót do logowania (DEV)
            </button>
            <LessonDemo />
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
            <LessonDemo />
         </div>
      );
   }

   return (
      <div>
         <button
            onClick={() => setCurrentView("lesson")}
            className="fixed top-4 right-4 z-50 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg text-xs font-mono"
         >
            🚀 DEV: Skip to Lesson
         </button>
         <AuthPanel />
      </div>
   );
}

export default App;
