import { invoke } from "@tauri-apps/api/core";
import { allCourses } from "../data/sampleLessons";
import { Course, Lesson, Module, LessonContent } from "../types/lesson";

export class LessonService {
    private cache: Map<string, Course> = new Map();

    async getCourses(refresh = false): Promise<Course[]> {
        if (!refresh && this.cache.size > 0) {
            return Array.from(this.cache.values());
        }

        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.warn("No access token, using local data");
                return allCourses;
            }

            const courses = await invoke<Course[]>("get_all_courses", {
                accessToken: token
            });

            // Update cache
            this.cache.clear();
            for (const course of courses) {
                this.cache.set(course.id, course);
            }

            return courses;
        } catch (error) {
            console.warn("Failed to fetch courses from database, falling back to local lessons", error);
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
        // Search in cache first
        for (const course of this.cache.values()) {
            for (const module of course.modules) {
                const lesson = module.lessons.find(l => l.id === lessonId);
                if (lesson) return lesson;
            }
        }

        // Search in fallback data
        for (const course of allCourses) {
            for (const module of course.modules) {
                const lesson = module.lessons.find(l => l.id === lessonId);
                if (lesson) return lesson;
            }
        }

        return null;
    }

    async createCourse(courseData: {
        title: string;
        description: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        language: string;
        color: string;
        isPublished: boolean;
        estimatedHours?: number;
        iconUrl?: string;
    }): Promise<Course> {
        const token = this.getTokenOrThrow();

        const course = await invoke<Course>("create_course", {
            course: {
                title: courseData.title,
                description: courseData.description,
                difficulty: courseData.difficulty,
                language: courseData.language,
                color: courseData.color,
                order_index: 0, // Default
                is_published: courseData.isPublished,
                estimated_hours: courseData.estimatedHours,
                icon_url: courseData.iconUrl,
            },
            accessToken: token
        });

        this.cache.clear();
        return course;
    }

    async createModule(moduleData: {
        course_id: string;
        title: string;
        description: string;
        orderIndex: number;
        iconEmoji?: string;
    }): Promise<Module> {
        const token = this.getTokenOrThrow();

        const module = await invoke<Module>("create_module", {
            module: {
                course_id: moduleData.course_id,
                title: moduleData.title,
                description: moduleData.description,
                order_index: moduleData.orderIndex,
                icon_emoji: moduleData.iconEmoji,
            },
            accessToken: token
        });

        this.cache.clear();
        return module;
    }

    async createLesson(lessonData: {
        module_id: string;
        title: string;
        description?: string;
        lessonType: "theory" | "exercise" | "quiz" | "project";
        content: LessonContent;
        language: "python" | "javascript" | "html" | "css" | "typescript";
        xpReward: number;
        orderIndex: number;
        isLocked?: boolean;
        estimatedMinutes?: number;
    }): Promise<Lesson> {
        const token = this.getTokenOrThrow();

        const lesson = await invoke<Lesson>("create_lesson", {
            lesson: {
                module_id: lessonData.module_id,
                title: lessonData.title,
                description: lessonData.description,
                lessonType: lessonData.lessonType,
                content: lessonData.content,
                language: lessonData.language,
                xpReward: lessonData.xpReward,
                orderIndex: lessonData.orderIndex,
                isLocked: lessonData.isLocked ?? false,
                estimatedMinutes: lessonData.estimatedMinutes,
            },
            accessToken: token
        });

        this.cache.clear();
        return lesson;
    }

    async updateLesson(lessonId: string, updates: {
        title?: string;
        description?: string;
        lessonType?: "theory" | "exercise" | "quiz" | "project";
        content?: LessonContent;
        language?: "python" | "javascript" | "html" | "css" | "typescript";
        xpReward?: number;
        orderIndex?: number;
        isLocked?: boolean;
        estimatedMinutes?: number;
    }): Promise<Lesson> {
        const token = this.getTokenOrThrow();

        const lesson = await invoke<Lesson>("update_lesson", {
            lessonId,
            updates,
            accessToken: token
        });

        this.cache.clear();
        return lesson;
    }

    async updateCourse(courseId: string, updates: {
        title?: string;
        description?: string;
        difficulty?: "beginner" | "intermediate" | "advanced";
        language?: string;
        color?: string;
        isPublished?: boolean;
        estimatedHours?: number;
        iconUrl?: string;
    }): Promise<Course> {
        const token = this.getTokenOrThrow();

        const course = await invoke<Course>("update_course", {
            courseId,
            updates,
            accessToken: token
        });

        this.cache.clear();
        return course;
    }

    async updateModule(moduleId: string, updates: {
        title?: string;
        description?: string;
        orderIndex?: number;
        iconEmoji?: string;
    }): Promise<Module> {
        const token = this.getTokenOrThrow();

        const module = await invoke<Module>("update_module", {
            moduleId,
            updates,
            accessToken: token
        });

        this.cache.clear();
        return module;
    }

    async deleteLesson(lessonId: string): Promise<void> {
        const token = this.getTokenOrThrow();

        await invoke("delete_lesson", {
            lessonId,
            accessToken: token
        });

        this.cache.clear();
    }

    async deleteModule(moduleId: string): Promise<void> {
        const token = this.getTokenOrThrow();

        // TODO: Implement delete_module command in Rust backend
        await invoke("delete_module", {
            moduleId,
            accessToken: token
        });

        this.cache.clear();
    }

    /**
     * Delete a course and all its modules/lessons
     * Note: Backend support for this method needs to be added in Rust
     */
    async deleteCourse(courseId: string): Promise<void> {
        const token = this.getTokenOrThrow();

        // TODO: Implement delete_course command in Rust backend
        await invoke("delete_course", {
            courseId,
            accessToken: token
        });

        this.cache.clear();
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    /**
     * Clear the memory cache - use after bulk operations
     */
    clearCache(): void {
        this.cache.clear();
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
}

export const lessonService = new LessonService();
