import { useState } from "react";
import CodeEditor from "./CodeEditor";
import LessonSuccessModal from "./LessonSuccessModal";

export default function LessonDemo() {
   const [output, setOutput] = useState<string>("");
   const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
   const [showSuccessModal, setShowSuccessModal] = useState(false);

   const starterCode = `# Napisz kod, który wypisze "Hello World"
print("Hello World")`;

   const expectedOutput = "Hello World";

   const handleRunCode = async (code: string) => {
      try {
         const match = code.match(/print\s*\(\s*["'](.+?)["']\s*\)/);

         if (match) {
            const printedValue = match[1];
            setOutput(printedValue);

            if (printedValue === expectedOutput) {
               setIsCorrect(true);
               setTimeout(() => {
                  setShowSuccessModal(true);
               }, 500);
            } else {
               setIsCorrect(false);
            }
         } else {
            setOutput("Error: No print statement found");
            setIsCorrect(false);
         }
      } catch (error) {
         setOutput(`Error: ${error}`);
         setIsCorrect(false);
      }
   };

   const handleNextLesson = () => {
      setShowSuccessModal(false);
      console.log("Moving to next lesson...");
   };

   return (
      <>
         <LessonSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            onNextLesson={handleNextLesson}
            xpEarned={10}
            lessonTitle="Twój pierwszy program w Pythonie"
         />
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
               <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                     <span>Python dla początkujących</span>
                     <span>›</span>
                     <span>Lekcja 1</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">
                     Twój pierwszy program w Pythonie
                  </h1>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 space-y-6">
                     <div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">
                           📚 Instrukcja
                        </h2>
                        <div className="prose prose-sm">
                           <p className="text-slate-700 mb-4">
                              W Pythonie używamy funkcji{" "}
                              <code className="bg-slate-100 px-2 py-1 rounded text-sm text-slate-700">
                                 print()
                              </code>{" "}
                              do wyświetlania tekstu na ekranie.
                           </p>
                           <p className="text-slate-700 mb-4">
                              Tekst musi być umieszczony w cudzysłowie
                              (pojedynczym lub podwójnym).
                           </p>
                           <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                              <p className="text-sm text-blue-900">
                                 💡 <strong>Wskazówka:</strong> Uruchom kod
                                 przyciskiem "Run Code" aby zobaczyć wynik!
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-2">Przykład:</p>
                        <pre className="text-green-400 font-mono text-sm">
                           <code>print("Witaj świecie!")</code>
                        </pre>
                        <p className="text-xs text-gray-400 mt-2">Wynik:</p>
                        <pre className="text-white font-mono text-sm">
                           <code>Witaj świecie!</code>
                        </pre>
                     </div>

                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-purple-900 mb-2">
                           🎯 Twoje zadanie
                        </h3>
                        <p className="text-purple-800">
                           Zmodyfikuj kod po prawej tak, aby wypisał:{" "}
                           <strong>"Hello World"</strong>
                        </p>
                     </div>

                     <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <span className="text-yellow-900 font-medium">
                           Nagroda za ukończenie:
                        </span>
                        <span className="text-2xl font-bold text-yellow-600">
                           +10 XP
                        </span>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3"></h2>
                        <CodeEditor
                           initialCode={starterCode}
                           language="python"
                           onRun={handleRunCode}
                           height="300px"
                           theme="vs-dark"
                        />
                     </div>

                     <div>
                        <div className="bg-gray-900 rounded-lg p-4 min-h-[120px] font-mono text-xl">
                           {output ? (
                              <div>
                                 <div className="text-gray-400 text-sm mb-2">
                                    Wynik:
                                 </div>
                                 <div className="text-green-400">{output}</div>
                              </div>
                           ) : (
                              <div className="text-gray-500 italic">
                                 Uruchom kod aby zobaczyć wynik...
                              </div>
                           )}
                        </div>
                     </div>

                     {isCorrect === false && (
                        <div className="rounded-lg p-5 bg-red-50/80 backdrop-blur-sm border-2 border-red-400">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-3xl">❌</span>
                              <h3 className="text-xl font-bold text-red-900">
                                 Nie do końca...
                              </h3>
                           </div>
                           <p className="text-red-800">
                              Wynik nie jest zgodny z oczekiwanym. Spróbuj
                              ponownie!
                           </p>
                           <div className="mt-3 text-sm text-red-700">
                              <strong>Oczekiwany wynik:</strong>{" "}
                              {expectedOutput}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}
