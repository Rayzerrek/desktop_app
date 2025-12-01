import { useState, useRef, useEffect } from 'react'
import { useUserProfile } from '../hooks/useUserProfile'
import { UserProfileModal } from './UserProfileModal'

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

export const UserProfileDropdown = () => {
  const { profile, loading } = useUserProfile()
  const [isOpen, setIsOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (loading || !profile) {
    return null
  }

  const initials = getInitials(profile.email, profile.username)
  const displayName = profile.username || profile.email.split('@')[0]

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border-2 border-indigo-500">
              {initials}
            </div>
          )}
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-800 dark:text-white">
              {displayName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Poziom {profile.level}</div>
          </div>
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="p-4 bg-indigo-600 text-white">
              <div className="flex items-center space-x-3">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{displayName}</div>
                  <div className="text-xs text-white/80 truncate">
                    {profile.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {profile.level}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Poziom</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {profile.total_xp}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">XP</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {profile.current_streak_days}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Seria dni</div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setShowModal(true)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Zobacz pełny profil
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <UserProfileModal onClose={() => {
        
        setShowModal(false)}
        } />}
    </>
  )
}
