import { useState } from 'react';
import {MdLightMode, MdDarkMode} from 'react-icons/md';

type Theme = 'light' | 'dark';

export default function ThemeToggle(){
  const [theme, setTheme] = useState<Theme>('dark');
  return (
    <button
      onClick = {() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className = "p-2 rounded-lg bg-slate-200 hover:bg-slate-300  transition-colors"
    >
    {theme === 'dark' ? (
      <MdLightMode className = 'w-5 h-5 text-slate-700'/>
    ) : (
      <MdDarkMode className = 'w-5 h-5 text-yellow-400'/>
    )}
    </button>
  )

}
