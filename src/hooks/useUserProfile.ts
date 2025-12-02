import { useState, useEffect } from 'react'
import { UserProfile, userProfileService } from '../services/UserProfileService'
import { useAuth } from './useAuth'

export function useUserProfile() {
  const { isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (isAuthenticated) {
        const userId = localStorage.getItem('user_id')
        if (!userId) {
          setError('User ID not found')
          setLoading(false)
          return
        }

        try {
          setLoading(true)
          const userProfile = await userProfileService.getUserProfile(userId)

          setProfile({
            ...userProfile,
          })
          setError(null);

        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'An unknown error occurred'
          )
          console.error('Failed to fetch user profile:', err)
        } finally {
          setLoading(false)
        }
      } else {
        setProfile(null)
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated])

  return { profile, loading, error }
}
