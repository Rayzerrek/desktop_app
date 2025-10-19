import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import CodeEditor from "./CodeEditor";
import LessonSuccessModal from "./LessonSuccessModal";
import { lessonService } from "../services/LessonService";
import { Lesson, Course } from "../types/lesson";
import { getNextLessonId, findCourseByLessonId } from "../utils/courseUtils";

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
   const [lesson, setLesson] = useState<Lesson | null>(null);
   const [course, setCourse] = useState<Course | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadLesson();
   }, [lessonId]);

   const loadLesson = async () => {
      try {
         const lessonData = await lessonService.getLessonById(lessonId);
         setLesson(lessonData);

         if (lessonData) {
            const courses = await lessonService.getCourses();
            const foundCourse = findCourseByLessonId(courses, lessonId);
            setCourse(foundCourse || null);
         }
      } catch (error) {
         console.error("Error loading lesson:", error);
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
               <div className="text-6xl mb-4 animate-spin">⏳</div>
               <p className="text-xl text-slate-600">Ładowanie lekcji...</p>
            </div>
         </div>
      );
   }

   if (!lesson) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
               <div className="text-6xl mb-4">❌</div>
               <p className="text-xl text-slate-600">Lekcja nie znaleziona</p>
            </div>
         </div>
      );
   }

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

   const handleNextLesson = async () => {
      setShowSuccessModal(false);
      console.log("Moving to next lesson from:", lessonId);

      const courses = await lessonService.getCourses();
      const nextId = getNextLessonId(courses, lessonId);

      if (nextId) {
         console.log("Next lesson:", nextId);
         onNextLesson?.(nextId);
      } else {
         console.log("This is the last lesson!");
      }
   };

   return (
      <>
         <LessonSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            onNextLesson={handleNextLesson}
            xpReward={lesson.xp_reward}
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
                        lesson.content.exampleCode && (
                           <div className="bg-gray-900 rounded-lg p-4">
                              {lesson.content.exampleDescription && (
                                 <p className="text-sm text-gray-300 mb-3">
                                    {lesson.content.exampleDescription}
                                 </p>
                              )}
                              <p className="text-xs text-gray-400 mb-2">
                                 Przykładowy kod:
                              </p>
                              <pre className="text-green-400 font-mono text-sm">
                                 <code>{lesson.content.exampleCode}</code>
                              </pre>
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
                           +{lesson.xp_reward} XP
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
