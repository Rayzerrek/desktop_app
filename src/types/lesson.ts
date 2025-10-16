export type LessonType = "theory" | "exercise" | "quiz" | "project";

export interface CodeBlock {
   type: "text" | "code" | "tip" | "warning" | "info";
   content: string;
   language?: string;
   code?: string;
}

export interface TheoryLesson {
   type: "theory";
   blocks: CodeBlock[];
}

export interface ExerciseLesson {
   type: "exercise";
   instruction: string;
   starterCode: string;
   solution: string;
   hint?: string;
   testCases?: {
      input?: string;
      expectedOutput: string;
      description?: string;
   }[];
}

export interface QuizOption {
   text: string;
   isCorrect: boolean;
   explanation?: string;
}

export interface QuizLesson {
   type: "quiz";
   question: string;
   options: QuizOption[];
   explanation?: string;
}

export interface ProjectLesson {
   type: "project";
   title: string;
   description: string;
   requirements: string[];
   starterCode?: string;
   hints?: string[];
}

export type LessonContent =
   | TheoryLesson
   | ExerciseLesson
   | QuizLesson
   | ProjectLesson;

export interface Lesson {
   id: string;
   title: string;
   description?: string;
   lessonType: LessonType;
   content: LessonContent;
   language: "python" | "javascript" | "html" | "css" | "typescript";
   xpReward: number;
   orderIndex: number;
   isLocked?: boolean;
   estimatedMinutes?: number;
}

export interface Module {
   id: string;
   title: string;
   description: string;
   lessons: Lesson[];
   orderIndex: number;
   iconEmoji?: string;
}

export interface Course {
   id: string;
   title: string;
   description: string;
   difficulty: "beginner" | "intermediate" | "advanced";
   language: string;
   modules: Module[];
   color: string;
   iconUrl?: string;
   estimatedHours?: number;
   isPublished: boolean;
}

export interface UserProgress {
   lessonId: string;
   status: "not_started" | "in_progress" | "completed";
   score?: number;
   attempts: number;
   completedAt?: string;
   timeSpentSeconds?: number;
}

export interface UserCourseProgress {
   courseId: string;
   progress: UserProgress[];
}
export type UserProgressData = UserProgress | UserCourseProgress;
