import { invoke } from "@tauri-apps/api/core";

export interface UserProgress {
   id?: string;
   user_id: string;
   lesson_id: string;
   status: "not_started" | "in_progress" | "completed";
   score?: number;
   attempts: number;
   completed_at?: string;
   time_spent_seconds?: number;
}

export interface CreateProgressInput {
   user_id: string;
   lesson_id: string;
   status: string;
   score?: number;
   attempts: number;
   completed_at?: string;
   time_spent_seconds?: number;
}

class ProgressService {
   async getUserProgress(userId: string): Promise<UserProgress[]> {
      const token = localStorage.getItem("access_token");
      if (!token) {
         throw new Error("No access token");
      }

      return await invoke<UserProgress[]>("get_user_progress", {
         userId,
         accessToken: token,
      });
   }

   async updateLessonProgress(
      userId: string,
      lessonId: string,
      status: "not_started" | "in_progress" | "completed",
      options?: {
         score?: number;
         attempts?: number;
      }
   ): Promise<UserProgress> {
      const token = localStorage.getItem("access_token");
      if (!token) {
         throw new Error("No access token");
      }

      const progressData: CreateProgressInput = {
         user_id: userId,
         lesson_id: lessonId,
         status,
         score: options?.score,
         attempts: options?.attempts || 1,
         completed_at: status === "completed" ? new Date().toISOString() : undefined,
      };

      return await invoke<UserProgress>("update_lesson_progress", {
         progress: progressData,
         accessToken: token,
      });
   }

   async markLessonCompleted(userId: string, lessonId: string): Promise<UserProgress> {
      return this.updateLessonProgress(userId, lessonId, "completed");
   }

   async markLessonInProgress(userId: string, lessonId: string): Promise<UserProgress> {
      return this.updateLessonProgress(userId, lessonId, "in_progress");
   }

   getLessonProgress(allProgress: UserProgress[], lessonId: string): UserProgress | undefined {
      return allProgress.find(p => p.lesson_id === lessonId);
   }

   calculateCourseProgress(allProgress: UserProgress[], lessonIds: string[]): number {
      if (lessonIds.length === 0) return 0;
      
      const completedCount = lessonIds.filter(id => {
         const progress = this.getLessonProgress(allProgress, id);
         return progress?.status === "completed";
      }).length;

      return Math.round((completedCount / lessonIds.length) * 100);
   }
}

export const progressService = new ProgressService();
