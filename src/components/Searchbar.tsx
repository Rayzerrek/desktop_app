import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FiSearch, FiX, FiLoader } from "react-icons/fi";

interface SearchResult {
    type: "course" | "lesson";
    id: string;
    title: string;
    description?: string;
    courseName?: string;
    moduleName?: string;
}

interface SearchBarProps {
    onResultSelect?: (result: SearchResult) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ 
    onResultSelect, 
    placeholder = "Szukaj kursów i lekcji...",
    className = ""
}: SearchBarProps) {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.warn("No access token for search");
                setIsLoading(false);
                return;
            }

            const searchResults = await invoke<SearchResult[]>("search_lessons", { 
                query: query.trim(),
                accessToken: token 
            });
            
            setResults(searchResults);
            setIsOpen(searchResults.length > 0);
            setSelectedIndex(-1);
        } catch (error) {
            console.error("Error searching lessons:", error);
            setResults([]);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const handleResultClick = (result: SearchResult) => {
        setQuery(result.title);
        setIsOpen(false);
        onResultSelect?.(result);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleResultClick(results[selectedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };
    

    return (
        <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {isLoading ? (
                        <FiLoader className="w-5 h-5 animate-spin" />
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
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl 
                             text-slate-800 placeholder-slate-400
                             focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100
                             transition-all duration-200 shadow-sm hover:shadow-md"
                />

                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 
                                 hover:text-slate-600 transition-colors"
                        aria-label="Clear search"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Search Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 
                              rounded-xl shadow-2xl overflow-hidden animate-slide-down">
                    <div className="max-h-96 overflow-y-auto">
                        {results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleResultClick(result)}
                                className={`w-full px-4 py-3 flex items-start gap-3 text-left 
                                          transition-colors border-b border-slate-100 last:border-b-0
                                          ${selectedIndex === index 
                                            ? 'bg-purple-50 border-l-4 border-l-purple-500' 
                                            : 'hover:bg-slate-50'
                                          }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-800 truncate">
                                            {result.title}
                                        </h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0
                                                       ${result.type === 'course' 
                                                         ? 'bg-blue-100 text-blue-700' 
                                                         : 'bg-green-100 text-green-700'
                                                       }`}>
                                            {result.type === 'course' ? 'Kurs' : 'Lekcja'}
                                        </span>
                                    </div>
                                    {result.description && (
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                            {result.description}
                                        </p>
                                    )}
                                    {result.courseName && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {result.courseName}
                                            {result.moduleName && ` • ${result.moduleName}`}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                        <span>Znaleziono {results.length} wyników</span>
                        <span className="text-slate-400">
                            <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">↑↓</kbd>
                            {' '}nawigacja{' '}
                            <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">Enter</kbd>
                            {' '}wybierz
                        </span>
                    </div>
                </div>
            )}

            {/* No Results */}
            {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 
                              rounded-xl shadow-xl p-6 text-center">
                    <p className="text-slate-600 font-medium">Brak wyników</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Spróbuj użyć innych słów kluczowych
                    </p>
                </div>
            )}
        </div>
    );
}