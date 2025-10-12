import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Toast, { ToastType } from "./Toast";

interface AuthResponse {
   success: boolean;
   message: string;
   user_id?: string;
   access_token?: string;
   refresh_token?: string;
}

export default function AuthPanel() {
   const [isLogin, setIsLogin] = useState(true);
   const [loading, setLoading] = useState(false);
   const [toast, setToast] = useState<{
      message: string;
      type: ToastType;
   } | null>(null);

   const handleLogin = async (email: string, password: string) => {
      setLoading(true);
      try {
         const response = await invoke<AuthResponse>("login_user", {
            email,
            password,
         });

         if (response.success) {
            setToast({
               message: response.message,
               type: "success",
            });
            console.log("User ID:", response.user_id);

            if (response.access_token) {
               localStorage.setItem("access_token", response.access_token);
            }
            if (response.refresh_token) {
               localStorage.setItem("refresh_token", response.refresh_token);
            }
            if (response.user_id) {
               localStorage.setItem("user_id", response.user_id);
            }
         } else {
            setToast({
               message: response.message,
               type: "error",
            });
         }
      } catch (error) {
         setToast({
            message: "Błąd podczas logowania: " + error,
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   };

   const handleRegister = async (
      email: string,
      password: string,
      username: string,
   ) => {
      setLoading(true);
      try {
         const response = await invoke<AuthResponse>("register_user", {
            email,
            password,
            username,
         });

         if (response.success) {
            setToast({
               message: response.message,
               type: "success",
            });
            console.log("User ID:", response.user_id);

            if (response.access_token) {
               localStorage.setItem("access_token", response.access_token);
            }
            if (response.refresh_token) {
               localStorage.setItem("refresh_token", response.refresh_token);
            }
            if (response.user_id) {
               localStorage.setItem("user_id", response.user_id);
            }
            setIsLogin(true);
         } else {
            setToast({
               message: response.message,
               type: "error",
            });
         }
      } catch (error) {
         setToast({
            message: "Błąd podczas rejestracji: " + error,
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         {toast && (
            <Toast
               message={toast.message}
               type={toast.type}
               onClose={() => setToast(null)}
            />
         )}
         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
               <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                     {isLogin ? "Witaj ponownie!" : "Dołącz do nas!"}
                  </h1>
                  <p className="text-gray-600">
                     {isLogin
                        ? "Zaloguj się, aby kontynuować naukę"
                        : "Stwórz konto i zacznij swoją przygodę"}
                  </p>
               </div>

               <div className="flex gap-2 mb-8 bg-gray-100 rounded-lg p-1">
                  <button
                     onClick={() => setIsLogin(true)}
                     className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                        isLogin
                           ? "bg-white text-blue-600 shadow-sm"
                           : "text-gray-600 hover:text-gray-800"
                     }`}
                  >
                     Logowanie
                  </button>
                  <button
                     onClick={() => setIsLogin(false)}
                     className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                        !isLogin
                           ? "bg-white text-green-600 shadow-sm"
                           : "text-gray-600 hover:text-gray-800"
                     }`}
                  >
                     Rejestracja
                  </button>
               </div>

               {isLogin ? (
                  <LoginForm onSubmit={handleLogin} disabled={loading} />
               ) : (
                  <RegisterForm onSubmit={handleRegister} disabled={loading} />
               )}

               <div className="mt-6 text-center text-sm text-gray-500">
                  {isLogin ? (
                     <p>
                        Nie masz konta?{" "}
                        <button
                           onClick={() => setIsLogin(false)}
                           className="text-blue-600 hover:text-blue-700 font-medium hover:cursor-pointer"
                        >
                           Zarejestruj się
                        </button>
                     </p>
                  ) : (
                     <p>
                        Masz już konto?{" "}
                        <button
                           onClick={() => setIsLogin(true)}
                           className="text-green-600 hover:text-green-700 font-medium hover:cursor-pointer"
                        >
                           Zaloguj się
                        </button>
                     </p>
                  )}
               </div>
            </div>
         </div>
      </>
   );
}
