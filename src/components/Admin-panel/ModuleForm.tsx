import { useState } from 'react'

interface NewModuleData {
  title: string
  description: string
  iconEmoji: string
}

interface ModuleFormProps {
  courseName: string
  onSubmit: (data: NewModuleData) => Promise<void>
}

export default function ModuleForm({ courseName, onSubmit }: ModuleFormProps) {
  const [newModule, setNewModule] = useState<NewModuleData>({
    title: '',
    description: '',
    iconEmoji: '📚',
  })

  const handleSubmit = async () => {
    await onSubmit(newModule)
    setNewModule({
      title: '',
      description: '',
      iconEmoji: '📚',
    })
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Krok 2: Dodaj moduł do kursu "{courseName}"
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        Moduły to sekcje w kursie. Każdy moduł zawiera lekcje.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tytuł modułu *
            </label>
            <input
              type="text"
              value={newModule.title}
              onChange={(e) =>
                setNewModule({ ...newModule, title: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="np. Podstawy składni"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ikona emoji
            </label>
            <input
              type="text"
              value={newModule.iconEmoji}
              onChange={(e) =>
                setNewModule({ ...newModule, iconEmoji: e.target.value })
              }
              maxLength={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-2xl text-center"
              placeholder="📚"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Opis modułu
          </label>
          <input
            type="text"
            value={newModule.description}
            onChange={(e) =>
              setNewModule({ ...newModule, description: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Co zawiera ten moduł?"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!newModule.title}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 
                     hover:from-green-700 hover:to-emerald-700 disabled:from-slate-300 
                     disabled:to-slate-300 text-white font-bold rounded-full 
                     transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
        >
          Dodaj moduł
        </button>
      </div>
    </div>
  )
}

export type { NewModuleData }
