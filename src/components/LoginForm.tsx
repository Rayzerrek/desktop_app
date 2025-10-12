import { useState } from "react";

interface LoginFormProps {
   onSubmit: (email: string, password: string) => void;
   disabled?: boolean;
}

export default function LoginForm({
   onSubmit,
   disabled = false,
}: LoginFormProps) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(email, password);
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-6">
         <div>
            <label
               htmlFor="email"
               className="block text-sm font-medium text-slate-700 mb-2"
            >
               Email
            </label>
            <input
               id="email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200"
               placeholder="twoj@email.com"
            />
         </div>

         <div>
            <label
               htmlFor="password"
               className="block text-sm font-medium text-slate-700 mb-2"
            >
               Hasło
            </label>
            <input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200"
               placeholder="••••••••"
            />
         </div>

         <button
            type="submit"
            disabled={disabled}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {disabled ? "Logowanie..." : "Zaloguj się"}
         </button>
      </form>
   );
}
