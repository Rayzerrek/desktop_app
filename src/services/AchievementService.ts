import { invoke } from '@tauri-apps/api/core'

type Category = 'courses' | 'streak' | 'xp' | 'special' | 'speed'

export interface Achievement {
  id: string
  title: string
  description: string
  icon_url: string
  category: Category
  requirement: number
  xp_reward: number
}

export class AchievementService {
  async getAvailableAchievements(): Promise<Achievement[]> {
    return await invoke<Achievement[]>('get_available_achievements')
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No access token')
    return await invoke<Achievement[]>('get_user_achievements', {
      userId,
      accessToken: token,
    })
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No access token')

    return await invoke<Achievement[]>('check_and_unlock_achievements', {
      userId,
      accessToken: token,
    })
  }
}

export const achievementService = new AchievementService()
