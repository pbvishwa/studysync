import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { LayoutDashboard, Users, Brain, LogOut, Flame, Star, Sun, Moon } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Brain,           label: 'AI Planner', path: '/planner'   },
  { icon: Users,           label: 'Groups',     path: '/groups'    },
]

export default function Sidebar({ profile }) {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const name     = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const xp       = profile?.xp || 0
  const level    = Math.floor(xp / 500) + 1
  const xpPct    = Math.round(((xp % 500) / 500) * 100)

  return (
    <aside style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-50 border-r">

      {/* Logo */}
      <div style={{ borderColor: 'var(--border)' }} className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9b] flex items-center justify-center text-base">⚡</div>
          <span style={{ color: 'var(--text)' }} className="font-syne font-extrabold text-lg tracking-tight">StudySync</span>
        </div>

        {/* Theme Toggle Row */}
        <button onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--muted)' }} className="text-xs font-medium">
            {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </span>
          {/* Toggle pill */}
          <div className="relative w-11 h-6 rounded-full flex items-center px-0.5 flex-shrink-0"
            style={{
              background: isDark ? 'linear-gradient(135deg,#2a2a3d,#1c1c28)' : 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
              border: '1px solid var(--border)',
            }}>
            <div className="w-4 h-4 rounded-full shadow flex items-center justify-center"
              style={{
                transform: isDark ? 'translateX(0px)' : 'translateX(20px)',
                background: isDark ? 'linear-gradient(135deg,#7c6aff,#5a48e0)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                transition: 'transform 0.3s ease',
              }}>
              {isDark ? <Moon size={9} className="text-white" /> : <Sun size={9} className="text-white" />}
            </div>
          </div>
        </button>
      </div>

      {/* XP Card */}
      <div style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
        className="mx-4 mt-4 px-4 py-3 rounded-xl border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star size={14} style={{ color: 'var(--accent2)' }} />
            <span style={{ color: 'var(--muted)' }} className="text-xs">Level {level}</span>
          </div>
          <span style={{ color: 'var(--accent2)' }} className="text-xs font-semibold">{xp.toLocaleString()} XP</span>
        </div>
        <div style={{ background: 'var(--bg)' }} className="h-1.5 rounded-full overflow-hidden">
          <div className="h-full rounded-full"
            style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', transition: 'width 0.5s ease' }} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Flame size={14} className="text-orange-400" />
          <span style={{ color: 'var(--muted)' }} className="text-xs">{profile?.streak || 0} day streak 🔥</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = pathname === path
          return (
            <Link key={path} to={path}
              style={{
                background: active ? 'rgba(124,106,255,0.1)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
                border: active ? '1px solid rgba(124,106,255,0.2)' : '1px solid transparent',
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90">
              <Icon size={18} />{label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ borderColor: 'var(--border)' }} className="p-4 border-t">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6aff] to-[#ff6a9b] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: 'var(--text)' }} className="text-sm font-medium truncate">{name}</p>
            <p style={{ color: 'var(--muted)' }} className="text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut}
          style={{ color: 'var(--muted)' }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}
