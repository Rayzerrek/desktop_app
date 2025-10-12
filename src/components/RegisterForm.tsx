import { useState } from "react";

interface RegisterFormProps {
   onSubmit: (email: string, password: string, username: string) => void;
   disabled?: boolean;
}

export default function RegisterForm({
   onSubmit,
   disabled = false,
}: RegisterFormProps) {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) {
         alert("Hasła nie są identyczne!");
         return;
      }
      onSubmit(email, password, username);
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-6">
         <div>
            <label
               htmlFor="username"
               className="block text-sm font-medium text-slate-700 mb-2"
            >
               Nazwa użytkownika
            </label>
            <input
               id="username"
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               required
               className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200"
               placeholder="twoja_nazwa"
            />
         </div>

         <div>
            <label
               htmlFor="register-email"
               className="block text-sm font-medium text-slate-700 mb-2"
            >
               Email
            </label>
            <input
               id="register-email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200"
               placeholder="twoj@email.com"
            />
         </div>

         <div>
            <label
               htmlFor="register-password"
               className="block text-sm font-medium text-slate-700 mb-2"
            >
               Hasło
            </label>
            <input
               id="register-password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               minLength={8}
               className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200"
               placeholder="••••••••"
            />
         </div>

         <div>
            <label
               htmlFor="confirm-password"
               className="block text-sm font-medium text-slate-700 mb-2"
            >
               Potwierdź hasło
            </label>
            <input
               id="confirm-password"
               type="password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               required
               minLength={8}
               className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200"
               placeholder="••••••••"
            />
         </div>

         <button
            type="submit"
            disabled={disabled}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {disabled ? "Rejestracja..." : "Zarejestruj się"}
         </button>
      </form>
   );
}
