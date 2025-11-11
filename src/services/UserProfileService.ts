import { invoke } from '@tauri-apps/api/core'

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  total_xp: number;
  level: number;
  current_streak_days: number;
  longest_streak_days: number;
  joined_at: string;
}

interface UserStatistics {
  total_lessons_completed: number;
  total_courses_completed: number;
  total_minutes_spent: number;
  average_score: number;
  lessons_this_week: number;
}

export class UserProfileService {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No access token')

    return await invoke<UserProfile>('get_user_profile', {
      userId,
      accessToken: token,
    })
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No access token')
    return await invoke<UserStatistics>('get_user_statistics', {
      userId,
      accessToken: token,
    })
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No access token')
    await invoke<void>('update_user_avatar', {
      userId,
      avatarUrl,
      accessToken: token,
    })
  }
  async updateUsername(userId: string, username: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No access token')
    await invoke<void>('update_user_username', {
      userId,
      username,
      accessToken: token,
    })
  }
}
export const userProfileService = new UserProfileService()

export type { UserProfile, UserStatistics }
