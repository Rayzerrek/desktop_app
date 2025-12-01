import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { FiSearch, FiX, FiLoader } from 'react-icons/fi'

interface SearchResult {
  type: 'course' | 'lesson'
  id: string
  title: string
  description?: string
  courseName?: string
  moduleName?: string
}

interface SearchBarProps {
  onResultSelect?: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  onResultSelect,
  placeholder = 'Szukaj kursów i lekcji...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300) 

    return () => clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.warn('No access token for search')
        setIsLoading(false)
        return
      }

      const searchResults = await invoke<SearchResult[]>('search_lessons', {
        query: query.trim(),
        accessToken: token,
      })

      setResults(searchResults)
      setIsOpen(searchResults.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error searching lessons:', error)
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.title)
    setIsOpen(false)
    onResultSelect?.(result)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input - Material 3 Style */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
          {isLoading ? (
            <FiLoader className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400" />
          ) : (
            <FiSearch className="w-5 h-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-surface-container rounded-full
                             text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400
                             focus:outline-none focus:ring-0
                             transition-all duration-300 ease-out
                             shadow-md hover:shadow-lg focus:shadow-xl
                             border border-transparent focus:border-purple-300 dark:focus:border-purple-500
                             dark:bg-slate-700"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400
                                 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1
                                 transition-all duration-200"
            aria-label="Clear search"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results - Material 3 Elevated Surface */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden 
                              animate-slide-down border border-slate-100 dark:border-slate-700"
          style={{
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className={`w-full px-5 py-4 flex items-start gap-3 text-left 
                                          transition-all duration-200
                                          border-b border-slate-50 dark:border-slate-700 last:border-b-0
                                          ${
                                            selectedIndex === index
                                              ? 'bg-purple-50/70 dark:bg-purple-900/30 backdrop-blur-sm'
                                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/80'
                                          }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {result.title}
                    </h4>
                    <span
                      className={`text-xs px-3 py-1 rounded-full flex-shrink-0 font-medium
                                                       ${
                                                         result.type ===
                                                         'course'
                                                           ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                                                           : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                                       }`}
                    >
                      {result.type === 'course' ? 'Kurs' : 'Lekcja'}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {result.description}
                    </p>
                  )}
                  {result.courseName && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                      <span className="font-medium">{result.courseName}</span>
                      {result.moduleName && (
                        <>
                          <span className="text-slate-400 dark:text-slate-600">•</span>
                          <span>{result.moduleName}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div
            className="px-5 py-3 bg-slate-50/80 dark:bg-slate-700/80 backdrop-blur-sm border-t border-slate-100 dark:border-slate-600
                                  text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between"
          >
            <span className="font-medium">
              Znaleziono {results.length} wyników
            </span>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <kbd className="px-2.5 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs font-medium shadow-sm">
                ↑↓
              </kbd>
              <span>nawigacja</span>
              <kbd className="px-2.5 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs font-medium shadow-sm">
                Enter
              </kbd>
              <span>wybierz</span>
            </span>
          </div>
        </div>
      )}

      {/* No Results - Material 3 */}
      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div
          className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-700"
          style={{
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <p className="text-slate-800 dark:text-white font-semibold text-lg">Brak wyników</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Spróbuj użyć innych słów kluczowych
          </p>
        </div>
      )}
    </div>
  )
}
