import { invoke } from "@tauri-apps/api/core";
import { allCourses } from "../data/sampleLessons";
import { Course, Lesson, Module, LessonContent, Difficulty, LessonType, CreateCourseDTO, CreateModuleDTO, CreateLessonDTO } from "../types/lesson";

export class LessonService {
    private cache = new Map<string, Course>();




    async getCourses(refresh = false): Promise<Course[]> {
        if (!refresh && this.cache.size > 0) {
            return Array.from(this.cache.values());
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
            console.warn("No access token, using local data");
            return allCourses;
        }

        try {
            const courses = await invoke<Course[]>("get_all_courses", { accessToken: token });
            
            this.cache.clear();
            courses.forEach(course => this.cache.set(course.id, course));

            return courses;
        } catch (error) {
            console.warn("Failed to fetch courses, falling back to local data:", error);
            return allCourses;
        }
    }

    async getLessonById(lessonId: string): Promise<Lesson | null> {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                return this.findLessonLocally(lessonId);
            }

            const lesson = await invoke<Lesson>("get_lesson_by_id", {
                lessonId,
                accessToken: token
            });

            return lesson;
        } catch (error) {
            console.warn(`Failed to fetch lesson ${lessonId}, searching locally`, error);
            return this.findLessonLocally(lessonId);
        }
    }

    private findLessonLocally(lessonId: string): Lesson | null {
        const sources = [...this.cache.values(), ...allCourses];
        
        for (const course of sources) {
            for (const module of course.modules) {
                const lesson = module.lessons.find(l => l.id === lessonId);
                if (lesson) return lesson;
            }
        }

        return null;
    }

    async createCourse(courseData: CreateCourseDTO): Promise<Course> {
        return this.invokeWithAuth<Course>("create_course", {
            course: {
                title: courseData.title,
                description: courseData.description,
                difficulty: courseData.difficulty,
                language: courseData.language,
                color: courseData.color,
                order_index: 0,
                is_published: courseData.isPublished,
                estimated_hours: courseData.estimatedHours,
                icon_url: courseData.iconUrl,
            }
        });
    }

    async createModule(moduleData: CreateModuleDTO): Promise<Module> {
        return this.invokeWithAuth<Module>("create_module", {
            module: {
                course_id: moduleData.course_id,
                title: moduleData.title,
                description: moduleData.description,
                order_index: moduleData.orderIndex,
                icon_emoji: moduleData.iconEmoji,
            }
        });
    }

    async createLesson(lessonData: CreateLessonDTO): Promise<void> {
        // Use invokeWithAuth to ensure accessToken is sent; backend uses serde aliasing
        // to map camelCase to snake_case where needed.
        await this.invokeWithAuth<unknown>("create_lesson", {
            lesson: {
                module_id: lessonData.module_id,
                title: lessonData.title,
                lessonType: lessonData.lessonType,
                content: lessonData.content,
                xpReward: lessonData.xpReward,
                orderIndex: lessonData.orderIndex ?? 0,
                isLocked: lessonData.isLocked ?? false,
                description: lessonData.description,
                language: lessonData.language,
                estimatedMinutes: lessonData.estimatedMinutes,
            },
        });
    }

    async updateLesson(lessonId: string, updates: {
        title?: string;
        description?: string;
        lessonType?: LessonType;
        content?: LessonContent;
        language?: "python" | "javascript" | "html" | "css" | "typescript";
        xpReward?: number;
        orderIndex?: number;
        isLocked?: boolean;
        estimatedMinutes?: number;
    }): Promise<Lesson> {
        return this.invokeWithAuth<Lesson>("update_lesson", { lessonId, updates });
    }

    async updateCourse(courseId: string, updates: {
        title?: string;
        description?: string;
        difficulty?: Difficulty;
        language?: string;
        color?: string;
        isPublished?: boolean;
        estimatedHours?: number;
        iconUrl?: string;
    }): Promise<Course> {
        return this.invokeWithAuth<Course>("update_course", { courseId, updates });
    }

    async updateModule(moduleId: string, updates: {
        title?: string;
        description?: string;
        orderIndex?: number;
        iconEmoji?: string;
    }): Promise<Module> {
        return this.invokeWithAuth<Module>("update_module", { moduleId, updates });
    }

    async deleteLesson(lessonId: string): Promise<void> {
        await this.invokeWithAuth<void>("delete_lesson", { lessonId });
    }

    async deleteModule(moduleId: string): Promise<void> {
        await this.invokeWithAuth<void>("delete_module", { moduleId });
    }

    async deleteCourse(courseId: string): Promise<void> {
        await this.invokeWithAuth<void>("delete_course", { courseId });
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem("access_token");
    }

    private getTokenOrThrow(): string {
        const token = localStorage.getItem("access_token");
        if (!token) {
            throw new Error("Not authenticated - access token missing");
        }
        return token;
    }

    private async invokeWithAuth<T>(command: string, params: any): Promise<T> {
        const token = this.getTokenOrThrow();
        const result = await invoke<T>(command, { ...params, accessToken: token });
        this.cache.clear();
        return result;
    }
}

export const lessonService = new LessonService();

