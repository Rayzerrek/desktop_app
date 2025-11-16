interface User {
  _id: string
  username?: string
  avatarUrl?: string
}
interface UserProgress {
  userId: string
  xp: number
  level: number
}
interface Achievement {
  _id: string
  name: string
  description: string
}
export type { User, UserProgress, Achievement }
