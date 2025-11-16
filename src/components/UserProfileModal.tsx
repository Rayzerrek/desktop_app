import { useEffect, useState } from 'react'
import { useUserProfile } from '../hooks/useUserProfile'
import { achievementService, Achievement } from '../services/AchievementService'
import {
  userProfileService,
  UserStatistics,
} from '../services/UserProfileService'

interface UserProfileModalProps {
  onClose: () => void
}

const getInitials = (email?: string, username?: string) => {
  if (username) {
    const names = username.split(' ')
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return username.substring(0, 2).toUpperCase()
  }
  if (email) {
    return email.substring(0, 2).toUpperCase()
  }
  return '?'
}

export const UserProfileModal = ({ onClose }: UserProfileModalProps) => {
  const { profile } = useUserProfile()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [statistics, setStatistics] = useState<UserStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return

      try {
        setLoading(true)
        const userId = localStorage.getItem('user_id')
        if (!userId) return

        const [userAchievements, userStats] = await Promise.all([
          achievementService.getUserAchievements(userId),
          userProfileService.getUserStatistics(userId),
        ])

        setAchievements(userAchievements)
        setStatistics(userStats)
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [profile])

  if (!profile) return null

  const initials = getInitials(profile.email, profile.username)
  const displayName = profile.username || profile.email.split('@')[0]

  const xpForNextLevel = profile.level * 1000
  const currentLevelXp = profile.total_xp % 1000
  const progressPercent = (currentLevelXp / xpForNextLevel) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative bg-indigo-600 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
          >
            ×
          </button>

          <div className="flex items-start space-x-6">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                {initials}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{displayName}</h2>
              <p className="text-white/80 mb-4">{profile.email}</p>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Poziom {profile.level}</span>
                  <span>Poziom {profile.level + 1}</span>
                </div>
                <div className="w-full bg-indigo-400 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-sm text-white/80 mt-1">
                  {currentLevelXp} / {xpForNextLevel} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Statystyki</h3>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-100 p-4 rounded-lg animate-pulse"
                >
                  <div className="h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : statistics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {statistics.total_lessons_completed}
                </div>
                <div className="text-sm text-slate-600">Ukończone lekcje</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {statistics.total_courses_completed}
                </div>
                <div className="text-sm text-slate-600">Ukończone kursy</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">
                  {statistics.total_minutes_spent}
                </div>
                <div className="text-sm text-slate-600">Minut nauki</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="text-3xl font-bold text-amber-600">
                  {statistics.average_score}%
                </div>
                <div className="text-sm text-slate-600">Średni wynik</div>
              </div>
            </div>
          ) : null}

          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Osiągnięcia
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-100 p-4 rounded-lg animate-pulse"
                >
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    {achievement.icon_url && (
                      <div className="text-3xl">{achievement.icon_url}</div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-2 text-xs text-amber-600 font-semibold">
                        +{achievement.xp_reward} XP
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg">Nie masz jeszcze żadnych osiągnięć</p>
              <p className="text-sm mt-2">
                Kontynuuj naukę, aby odblokować swoje pierwsze osiągnięcie
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
