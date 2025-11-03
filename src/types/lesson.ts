interface CodeBlock {
  type: 'text' | 'code' | 'tip' | 'warning' | 'info'
  content: string
  language?: string
  code?: string
}

interface TheoryLesson {
  type: 'theory'
  blocks: CodeBlock[]
}

interface ExerciseLesson {
  type: 'exercise'
  instruction: string
  starterCode: string
  solution: string
  hint?: string
  exampleCode?: string
  exampleDescription?: string
  testCases?: {
    input?: string
    expectedOutput: string
    description?: string
  }[]
}

interface QuizOption {
  text: string
  isCorrect: boolean
  explanation?: string
}

interface QuizLesson {
  type: 'quiz'
  question: string
  options: QuizOption[]
  explanation?: string
}
interface CreateCourseDTO {
  title: string
  description: string
  difficulty: Difficulty
  language: string
  color: string
  order_index: 0
  isPublished: boolean
  estimatedHours?: number
  iconUrl?: string
}
interface CreateModuleDTO {
  course_id: string
  title: string
  description: string
  orderIndex: number
  iconEmoji?: string
}
interface CreateLessonDTO {
  module_id: string
  title: string
  description?: string
  lessonType: LessonType
  content: LessonContent
  language: 'python' | 'javascript' | 'html' | 'css' | 'typescript'
  xpReward: number
  orderIndex: number
  isLocked?: boolean
  estimatedMinutes?: number
}

interface ProjectLesson {
  type: 'project'
  title: string
  description: string
  requirements: string[]
  starterCode?: string
  hints?: string[]
}

type LessonContent = TheoryLesson | ExerciseLesson | QuizLesson | ProjectLesson

interface Lesson {
  id: string
  title: string
  description?: string
  lessonType: LessonType
  content: LessonContent
  language: 'python' | 'javascript' | 'html' | 'css' | 'typescript'
  xp_reward: number
  orderIndex: number
  isLocked?: boolean
  estimatedMinutes?: number
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  orderIndex: number
  iconEmoji?: string
}

interface Course {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  modules: Module[]
  color: string
  iconUrl?: string
  estimatedHours?: number
  isPublished: boolean
}

interface UserProgress {
  lessonId: string
  status: 'not_started' | 'in_progress' | 'completed'
  score?: number
  attempts: number
  completedAt?: string
  timeSpentSeconds?: number
}
type Difficulty = 'beginner' | 'intermediate' | 'advanced'
type LessonType = 'theory' | 'exercise' | 'quiz' | 'project'
type Language = 'python' | 'javascript' | 'html' | 'css' | 'typescript'

interface UserCourseProgress {
  courseId: string
  progress: UserProgress[]
}
type UserProgressData = UserProgress | UserCourseProgress

export type {
  CodeBlock,
  TheoryLesson,
  ExerciseLesson,
  QuizLesson,
  QuizOption,
  ProjectLesson,
  LessonContent,
  Lesson,
  Module,
  Course,
  UserProgress,
  CreateCourseDTO,
  CreateModuleDTO,
  CreateLessonDTO,
  Difficulty,
  LessonType,
  Language,
  UserProgressData,
  UserCourseProgress,
}
