import { useEffect, useState } from "react";

interface LessonSuccessModalProps {
   isOpen: boolean;
   onClose: () => void;
   onNextLesson: () => void;
   xpEarned: number;
   lessonTitle: string;
}

export default function LessonSuccessModal({
   isOpen,
   onClose,
   onNextLesson,
   xpEarned,
   lessonTitle,
}: LessonSuccessModalProps) {
   const [isAnimating, setIsAnimating] = useState(false);

   useEffect(() => {
      if (isOpen) {
         setIsAnimating(true);
      }
   }, [isOpen]);

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
         onClick={onClose}
      >
         <div
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-500 ${
               isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
         >
            <div className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-8 text-center">
               <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                     <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                           left: `${Math.random() * 100}%`,
                           top: `${Math.random() * 100}%`,
                           animationDelay: `${Math.random() * 2}s`,
                           animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                     >
                        {i % 3 === 0 ? "⭐" : i % 3 === 1 ? "✨" : "🎉"}
                     </div>
                  ))}
               </div>

               <div className="relative mb-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg animate-bounce-once">
                     <span className="text-6xl">🎉</span>
                  </div>
               </div>

               <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  Gratulacje!
               </h2>
               <p className="text-white text-lg opacity-90">
                  Ukończyłeś lekcję
               </p>
            </div>

            <div className="p-8">
               <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                     {lessonTitle}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                     <span className="text-sm">Zdobyte doświadczenie:</span>
                  </div>
               </div>

               <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 mb-6 text-center shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-white text-5xl font-bold mb-1 animate-pulse">
                     +{xpEarned} XP
                  </div>
                  <div className="text-yellow-100 text-sm font-medium">
                     Kontynuuj naukę aby zdobyć więcej!
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                     <div className="text-2xl mb-1">🔥</div>
                     <div className="text-xs text-gray-600">Streak</div>
                     <div className="text-lg font-bold text-blue-600">5</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                     <div className="text-2xl mb-1">📚</div>
                     <div className="text-xs text-gray-600">Lekcji</div>
                     <div className="text-lg font-bold text-purple-600">12</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                     <div className="text-2xl mb-1">⭐</div>
                     <div className="text-xs text-gray-600">Total XP</div>
                     <div className="text-lg font-bold text-green-600">250</div>
                  </div>
               </div>

               <div className="space-y-3">
                  <button
                     onClick={onNextLesson}
                     className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                     Następna lekcja →
                  </button>
                  <button
                     onClick={onClose}
                     className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                  >
                     Powrót do kursu
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
