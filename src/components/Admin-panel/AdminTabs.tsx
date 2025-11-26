export type AdminTabType = 'courses' | 'lessons' | 'create' | 'create-course'

interface AdminTabsProps {
  activeTab: AdminTabType
  onTabChange: (tab: AdminTabType) => void
}

export default function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div
      className="flex gap-2 mb-8 bg-white rounded-full p-1.5 shadow-lg border border-slate-200"
      style={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      }}
    >
      <button
        onClick={() => onTabChange('courses')}
        className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
          activeTab === 'courses'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        Kursy
      </button>
      <button
        onClick={() => onTabChange('create-course')}
        className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
          activeTab === 'create-course'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        Utwórz kurs
      </button>
      <button
        onClick={() => onTabChange('lessons')}
        className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
          activeTab === 'lessons'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        Wszystkie lekcje
      </button>
      <button
        onClick={() => onTabChange('create')}
        className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
          activeTab === 'create'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        Utwórz lekcję
      </button>
    </div>
  )
}
