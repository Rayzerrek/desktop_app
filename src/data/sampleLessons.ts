import { Lesson, Module, Course } from "../types/lesson";

// Python - Lesson 1: Hello World
const pythonLesson1: Lesson = {
   id: "py-001",
   title: "Twój pierwszy program w Pythonie",
   description: "Naucz się wyświetlać tekst w konsoli",
   lessonType: "exercise",
   language: "python",
   xpReward: 10,
   orderIndex: 1,
   estimatedMinutes: 5,
   content: {
      type: "exercise",
      instruction: "Napisz kod, który wyświetli w konsoli tekst: Hello World",
      starterCode:
         '# Napisz kod, który wypisze "Hello World"\nprint("Hello World")',
      solution: 'print("Hello World")',
      hint: "Użyj funkcji print() i umieść tekst w cudzysłowie",
      testCases: [
         {
            expectedOutput: "Hello World",
            description: "Program powinien wyświetlić dokładnie: Hello World",
         },
      ],
   },
};

// Python - Lesson 2: Variables
const pythonLesson2: Lesson = {
   id: "py-002",
   title: "Zmienne w Pythonie",
   description: "Poznaj podstawy zmiennych",
   lessonType: "exercise",
   language: "python",
   xpReward: 15,
   orderIndex: 2,
   estimatedMinutes: 8,
   content: {
      type: "exercise",
      instruction:
         "Stwórz zmienną 'name' z wartością 'Python' i wyświetl ją używając print()",
      starterCode: "# Stwórz zmienną name i wyświetl ją\n",
      solution: 'name = "Python"\nprint(name)',
      hint: "Pamiętaj: nazwa_zmiennej = wartość, potem print(nazwa_zmiennej)",
      testCases: [
         {
            expectedOutput: "Python",
            description: "Program powinien wyświetlić: Python",
         },
      ],
   },
};

// Python - Lesson 3: Quiz
const pythonLesson3: Lesson = {
   id: "py-003",
   title: "Quiz: Podstawy Pythona",
   description: "Sprawdź swoją wiedzę",
   lessonType: "quiz",
   language: "python",
   xpReward: 10,
   orderIndex: 3,
   estimatedMinutes: 3,
   content: {
      type: "quiz",
      question: "Która funkcja służy do wyświetlania tekstu w konsoli?",
      options: [
         {
            text: "console.log()",
            isCorrect: false,
            explanation: "To funkcja z JavaScript!",
         },
         {
            text: "print()",
            isCorrect: true,
            explanation: "Dokładnie! print() to podstawowa funkcja Pythona.",
         },
         {
            text: "echo()",
            isCorrect: false,
            explanation: "To komenda z bash/PHP.",
         },
         {
            text: "printf()",
            isCorrect: false,
            explanation: "To funkcja z języka C.",
         },
      ],
      explanation:
         "W Pythonie używamy funkcji print() do wyświetlania tekstu w konsoli.",
   },
};
// Python - Lesson 4 - for
const pythonLesson4: Lesson = {
   id: "py-004",
   title: "Pętle w Pythonie",
   lessonType: "exercise",
   language: "python",
   xpReward: 20,
   orderIndex: 4,
   estimatedMinutes: 15,
   content: {
      type: "exercise",
      instruction:
         "Pętla for jest używana do iteracji po elementach sekwencji. Funkcja range() tworzy sekwencję liczb całkowitych.",
      starterCode: "# Twój kod \n",
      solution: "for i in range(5):\n    print(i)",
   },
};
// JavaScript - Lesson 1
const jsLesson1: Lesson = {
   id: "js-001",
   title: "Console.log w JavaScript",
   description: "Wyświetl swoją pierwszą wiadomość",
   lessonType: "exercise",
   language: "javascript",
   xpReward: 10,
   orderIndex: 1,
   estimatedMinutes: 5,
   content: {
      type: "exercise",
      instruction:
         'Użyj console.log() aby wyświetlić tekst: "Hello JavaScript"',
      starterCode: '// Wyświetl "Hello JavaScript"\n',
      solution: 'console.log("Hello JavaScript");',
      testCases: [
         {
            expectedOutput: "Hello JavaScript",
            description: "Program powinien wyświetlić: Hello JavaScript",
         },
      ],
   },
};

// JavaScript - Lesson 2
const jsLesson2: Lesson = {
   id: "js-002",
   title: "Zmienne: let i const",
   description: "Naucz się deklarować zmienne",
   lessonType: "exercise",
   language: "javascript",
   xpReward: 15,
   orderIndex: 2,
   estimatedMinutes: 8,
   content: {
      type: "exercise",
      instruction:
         "Stwórz stałą 'greeting' o wartości 'Cześć!' i wyświetl ją w konsoli",
      starterCode: "// Stwórz stałą greeting i wyświetl ją\n",
      solution: 'const greeting = "Cześć!";\nconsole.log(greeting);',
      hint: "Użyj const dla stałej wartości, potem console.log()",
      testCases: [
         {
            expectedOutput: "Cześć!",
            description: "Program powinien wyświetlić: Cześć!",
         },
      ],
   },
};

// HTML - Lesson 1
const htmlLesson1: Lesson = {
   id: "html-001",
   title: "Twój pierwszy tag HTML",
   description: "Naucz się tworzyć nagłówki",
   lessonType: "exercise",
   language: "html",
   xpReward: 10,
   orderIndex: 1,
   estimatedMinutes: 5,
   content: {
      type: "exercise",
      instruction: "Stwórz nagłówek h1 z tekstem: Witaj w HTML",
      starterCode: "<!-- Stwórz nagłówek h1 -->\n",
      solution: "<h1>Witaj w HTML</h1>",
      hint: "Tag h1 to: <h1>twój tekst</h1>",
      testCases: [
         {
            expectedOutput: "<h1>Witaj w HTML</h1>",
            description: "Nagłówek powinien zawierać tekst: Witaj w HTML",
         },
      ],
   },
};

// Modules
const pythonModule1: Module = {
   id: "mod-py-001",
   title: "Podstawy Pythona",
   description: "Poznaj podstawy programowania w Pythonie",
   orderIndex: 1,
   iconEmoji: "🐍",
   lessons: [pythonLesson1, pythonLesson2, pythonLesson3, pythonLesson4],
};

const jsModule1: Module = {
   id: "mod-js-001",
   title: "Podstawy JavaScript",
   description: "Pierwsze kroki w JavaScript",
   orderIndex: 1,
   iconEmoji: "📜",
   lessons: [jsLesson1, jsLesson2],
};

const htmlModule1: Module = {
   id: "mod-html-001",
   title: "Wprowadzenie do HTML",
   description: "Twórz strony internetowe",
   orderIndex: 1,
   iconEmoji: "🌐",
   lessons: [htmlLesson1],
};

// Courses
export const pythonCourse: Course = {
   id: "course-python",
   title: "Python dla początkujących: nauka krok po kroku",
   description: "Naucz się programowania od podstaw",
   difficulty: "beginner",
   language: "python",
   color: "#3776AB",
   estimatedHours: 10,
   isPublished: true,
   modules: [pythonModule1],
};

export const jsCourse: Course = {
   id: "course-javascript",
   title: "JavaScript: Podstawy programowania",
   description: "Poznaj język internetu",
   difficulty: "beginner",
   language: "javascript",
   color: "#F7DF1E",
   estimatedHours: 12,
   isPublished: true,
   modules: [jsModule1],
};

export const htmlCourse: Course = {
   id: "course-html",
   title: "HTML & CSS dla początkujących",
   description: "Twórz piękne strony internetowe",
   difficulty: "beginner",
   language: "html",
   color: "#E34F26",
   estimatedHours: 8,
   isPublished: true,
   modules: [htmlModule1],
};

export const allCourses: Course[] = [pythonCourse, jsCourse, htmlCourse];

export const getAllLessons = (courseId: string): Lesson[] => {
   const course = allCourses.find((c) => c.id === courseId);
   if (!course) return [];

   return course.modules.flatMap((module) => module.lessons);
};

export const getLessonById = (lessonId: string): Lesson | undefined => {
   for (const course of allCourses) {
      for (const module of course.modules) {
         const lesson = module.lessons.find((l) => l.id === lessonId);
         if (lesson) return lesson;
      }
   }
   return undefined;
};
