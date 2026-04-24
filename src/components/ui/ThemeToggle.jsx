import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`
        relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1
        ${theme === 'dark'
          ? 'bg-surface2 border-border'
          : 'bg-accent/10 border-accent/30'
        }
        ${className}
      `}
    >
      {/* Track icons */}
      <Moon size={11} className={`absolute left-1.5 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-60 text-accent' : 'opacity-0'}`} />
      <Sun  size={11} className={`absolute right-1.5 transition-opacity duration-300 ${theme === 'light' ? 'opacity-60 text-accent' : 'opacity-0'}`} />

      {/* Thumb */}
      <div className={`
        w-5 h-5 rounded-full shadow-md flex items-center justify-center transition-all duration-300
        ${theme === 'dark'
          ? 'translate-x-0 bg-surface border border-border'
          : 'translate-x-7 bg-accent'
        }
      `}>
        {theme === 'dark'
          ? <Moon size={10} className="text-accent" />
          : <Sun  size={10} className="text-white" />
        }
      </div>
    </button>
  )
}
