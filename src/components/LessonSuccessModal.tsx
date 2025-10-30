import { useEffect, useState } from "react";

interface LessonSuccessModalProps {
   isOpen: boolean;
   onClose: () => void;
   onNextLesson: () => void;
   xpReward: number;
   lessonTitle: string;
}

export default function LessonSuccessModal({
   isOpen,
   onClose,
   onNextLesson,
   xpReward,
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
            className={`bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-500 ${
               isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
               boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25), 0 10px 30px rgba(0, 0, 0, 0.15)'
            }}
         >
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 p-10 text-center">
               <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl">
                     <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                     </svg>
                  </div>
               </div>

               <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  Gratulacje!
               </h2>
               <p className="text-white text-xl opacity-95">
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

               <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 mb-6 text-center shadow-lg">
                  <div className="text-white text-5xl font-bold mb-1">
                     +{xpReward} XP
                  </div>
                  <div className="text-amber-50 text-sm font-medium">
                     Kontynuuj naukę aby zdobyć więcej!
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                     <div className="text-xs text-slate-600 font-medium mb-1">Streak</div>
                     <div className="text-2xl font-bold text-blue-600">5</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                     <div className="text-xs text-slate-600 font-medium mb-1">Lekcji</div>
                     <div className="text-2xl font-bold text-purple-600">12</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                     <div className="text-xs text-slate-600 font-medium mb-1">Total XP</div>
                     <div className="text-2xl font-bold text-green-600">250</div>
                  </div>
               </div>

               <div className="space-y-3">
                  <button
                     onClick={onNextLesson}
                     className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                     Następna lekcja
                  </button>
                  <button
                     onClick={onClose}
                     className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-2xl transition-all duration-200"
                  >
                     Powrót do kursu
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
