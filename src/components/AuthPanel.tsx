import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPanel() {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (email: string, password: string) => {
    console.log("Logowanie:", { email, password });
  };

  const handleRegister = (email: string, password: string, username: string) => {
    console.log("Rejestracja:", { email, password, username });
  };

  return (
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
          <LoginForm onSubmit={handleLogin} />
        ) : (
          <RegisterForm onSubmit={handleRegister} />
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
  );
}
