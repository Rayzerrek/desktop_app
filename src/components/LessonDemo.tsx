import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import CodeEditor from "./CodeEditor";
import LessonSuccessModal from "./LessonSuccessModal";
import { getLessonById, allCourses } from "../data/sampleLessons";

interface CodeValidationResponse {
   success: boolean;
   output: string;
   error?: string;
   is_correct: boolean;
}

interface LessonDemoProps {
   lessonId?: string;
   onNextLesson?: (nextLessonId: string) => void;
   onBackToCourse?: () => void;
}

export default function LessonDemo({
   lessonId = "py-001",
   onNextLesson,
}: LessonDemoProps) {
   const [output, setOutput] = useState<string>("");
   const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
   const [showSuccessModal, setShowSuccessModal] = useState(false);

   console.log("LessonDemo - Received lessonId:", lessonId);
   const lesson = getLessonById(lessonId);
   console.log(
      "LessonDemo - Found lesson:",
      lesson?.title,
      "Language:",
      lesson?.language,
   );

   if (!lesson) {
      return <div>Lesson not found</div>;
   }

   const course = allCourses.find((c) =>
      c.modules.some((m) => m.lessons.some((l) => l.id === lessonId)),
   );

   const starterCode =
      lesson.content.type === "exercise" ? lesson.content.starterCode : "";
   const expectedOutput =
      lesson.content.type === "exercise" && lesson.content.testCases?.[0]
         ? lesson.content.testCases[0].expectedOutput
         : "";

   const handleRunCode = async (code: string) => {
      try {
         if (lesson.language === "html") {
            if (code.includes(expectedOutput)) {
               setOutput(expectedOutput);
               setIsCorrect(true);
               setTimeout(() => {
                  setShowSuccessModal(true);
               }, 500);
            } else {
               setOutput("Error: Expected output not found in HTML");
               setIsCorrect(false);
            }
            return;
         }

         const result = await invoke<CodeValidationResponse>("validate_code", {
            code,
            language: lesson.language,
            expectedOutput: expectedOutput,
         });

         if (result.error) {
            setOutput(result.error);
            setIsCorrect(false);
         } else {
            setOutput(result.output);
            setIsCorrect(result.is_correct);

            if (result.is_correct) {
               setTimeout(() => {
                  setShowSuccessModal(true);
               }, 500);
            }
         }
      } catch (error) {
         setOutput(`Error: ${error}`);
         setIsCorrect(false);
      }
   };

   const handleNextLesson = () => {
      setShowSuccessModal(false);
      console.log("Moving to next lesson from:", lessonId);

      // Find next lesson
      if (course) {
         const allLessons = course.modules.flatMap((m) => m.lessons);
         const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

         if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            console.log("Next lesson:", nextLesson.id);
            onNextLesson?.(nextLesson.id);
         } else {
            console.log("This is the last lesson!");
         }
      }
   };

   return (
      <>
         <LessonSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            onNextLesson={handleNextLesson}
            xpReward={lesson.xpReward}
            lessonTitle={lesson.title}
         />
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
               <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                     <span>{course?.title || "Kurs"}</span>
                     <span>›</span>
                     <span>Lekcja {lesson.orderIndex}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">
                     {lesson.title}
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
                              {lesson.description}
                           </p>
                           
                        </div>
                     </div>

                     {lesson.content.type === "exercise" &&
                        lesson.content.solution && (
                           <div className="bg-gray-900 rounded-lg p-4">
                              <p className="text-xs text-gray-400 mb-2">
                                 Przykład:
                              </p>
                              <pre className="text-green-400 font-mono text-sm">
                                 <code>{lesson.content.solution}</code>
                              </pre>
                              {expectedOutput && (
                                 <>
                                    <p className="text-xs text-gray-400 mt-2">
                                       Wynik:
                                    </p>
                                    <pre className="text-white font-mono text-sm">
                                       <code>{expectedOutput}</code>
                                    </pre>
                                 </>
                              )}
                           </div>
                        )}
                        

                     {lesson.content.type === "exercise" && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
                           <h3 className="text-lg font-semibold text-purple-900 mb-2">
                              🎯 Twoje zadanie
                           </h3>
                           <p className="text-purple-800">
                              {lesson.content.instruction}
                           </p>
                        </div>
                     )}
                     {lesson.content.type === "exercise" &&
                              lesson.content.hint && (
                                 <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                                    <p className="text-sm text-blue-900">
                                       💡 <strong>Wskazówka:</strong>{" "}
                                       {lesson.content.hint}
                                    </p>
                                 </div>
                              )}

                     <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <span className="text-yellow-900 font-medium">
                           Nagroda za ukończenie:
                        </span>
                        <span className="text-2xl font-bold text-yellow-600">
                           +{lesson.xpReward} XP
                        </span>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3"></h2>
                        <CodeEditor
                           initialCode={starterCode}
                           language={lesson.language}
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
