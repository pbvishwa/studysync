import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Sun, Moon } from 'lucide-react'

export default function Landing() {
  const [tab, setTab] = useState('login')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()

  const openModal = (t = 'login') => { setTab(t); setModalOpen(true); setError('') }
  const closeModal = () => setModalOpen(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        const { error } = await signIn(form.email, form.password)
        if (error) throw error
      } else {
        const { error } = await signUp(form.email, form.password, form.name)
        if (error) throw error
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  // Theme tokens
  const t = {
    pageBg:     isDark ? 'bg-[#0a0a0f]'   : 'bg-[#f4f4fb]',
    navBg:      isDark ? 'bg-[#0a0a0f]/70 backdrop-blur-xl border-white/5' : 'bg-white/70 backdrop-blur-xl border-black/5',
    cardBg:     isDark ? 'bg-[#16161f] border-[#2a2a3d]' : 'bg-white border-gray-200',
    card2Bg:    isDark ? 'bg-[#1c1c28] border-[#2a2a3d]' : 'bg-gray-50 border-gray-200',
    modalBg:    isDark ? 'bg-[#13131a] border-[#2a2a3d]' : 'bg-white border-gray-200',
    inputBg:    isDark ? 'bg-[#1c1c28] border-[#2a2a3d] text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400',
    selectBg:   isDark ? 'bg-[#1c1c28] border-[#2a2a3d] text-white' : 'bg-gray-50 border-gray-200 text-gray-900',
    toggleBg:   isDark ? 'bg-[#1c1c28] border-[#2a2a3d]' : 'bg-gray-100 border-gray-200',
    tabInactive: isDark ? 'bg-[#1c1c28]' : 'bg-gray-100',
    stepNum:    isDark ? 'text-[#2a2a3d]' : 'text-gray-200',
    divider:    isDark ? 'bg-[#2a2a3d]'  : 'bg-gray-200',
    overlayBg:  isDark ? 'bg-black/70'   : 'bg-black/40',
    orb1:       isDark ? 'rgba(124,106,255,0.18)' : 'rgba(124,106,255,0.10)',
    orb2:       isDark ? 'rgba(255,106,155,0.12)' : 'rgba(255,106,155,0.08)',
    text:       isDark ? 'text-[#f0f0f8]' : 'text-gray-900',
    muted:      isDark ? 'text-[#7a7a9a]' : 'text-gray-500',
    mutedHover: isDark ? 'hover:text-white' : 'hover:text-gray-900',
    label:      isDark ? 'text-[#7a7a9a]' : 'text-gray-500',
    closeBtn:   isDark ? 'bg-[#1c1c28] text-[#7a7a9a] hover:bg-[#2a2a3d] hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900',
    googleBtn:  isDark ? 'bg-[#1c1c28] border-[#2a2a3d] text-white hover:bg-[#2a2a3d]' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100',
    secondaryBtn: isDark ? 'border-[#2a2a3d] text-white hover:bg-[#1c1c28]' : 'border-gray-200 text-gray-700 hover:bg-gray-50',
    cancelBtn:  isDark ? 'border-[#2a2a3d] text-[#7a7a9a] hover:text-white hover:bg-[#1c1c28]' : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50',
    tagCard:    isDark ? 'hover:border-[#7c6aff]/40' : 'hover:border-[#7c6aff]/60 hover:shadow-lg',
  }

  return (
    <div className={`min-h-screen ${t.pageBg} ${t.text} relative overflow-x-hidden transition-colors duration-300`}>

      {/* BG Orbs */}
      <div className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0 transition-all duration-500"
        style={{ background: `radial-gradient(circle, ${t.orb1} 0%, transparent 70%)`, top: '-200px', right: '-100px', filter: 'blur(100px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 transition-all duration-500"
        style={{ background: `radial-gradient(circle, ${t.orb2} 0%, transparent 70%)`, bottom: '100px', left: '-100px', filter: 'blur(100px)' }} />

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-5 border-b ${t.navBg} transition-colors duration-300`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9b] flex items-center justify-center">⚡</div>
          <span className="font-syne font-extrabold text-lg">StudySync</span>
        </div>

        <div className="flex items-center gap-8">
          <a href="#features" className={`${t.muted} ${t.mutedHover} text-sm font-medium transition-colors`}>Features</a>
          <a href="#how" className={`${t.muted} ${t.mutedHover} text-sm font-medium transition-colors`}>How it works</a>
          <button onClick={() => openModal('login')} className={`${t.muted} ${t.mutedHover} text-sm font-medium transition-colors`}>Login</button>

          {/* 🌙 DARK / LIGHT TOGGLE */}
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1 ${t.toggleBg} ${isDark ? 'justify-end' : 'justify-start'}`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
              ${isDark ? 'bg-[#7c6aff]' : 'bg-yellow-400'}`}>
              {isDark
                ? <Moon size={11} className="text-white" />
                : <Sun size={11} className="text-white" />
              }
            </div>
          </button>

          <Button onClick={() => openModal('signup')} className="!py-2.5 !px-5 !text-sm">Get Started →</Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 bg-[#7c6aff]/10 border border-[#7c6aff]/30 rounded-full px-4 py-1.5 text-xs font-medium text-[#7c6aff] mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6affd4] animate-pulse-dot" />
          AI-Powered · Now in Beta
        </div>

        <h1 className="font-syne font-extrabold text-6xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl animate-fade-up delay-100">
          Study Smarter.<br/>
          <span className="grad-text">Together.</span>
        </h1>

        <p className={`mt-6 text-lg ${t.muted} max-w-lg leading-relaxed font-light animate-fade-up delay-200`}>
          StudySync turns your syllabus into a personalized AI study plan — with group accountability, streaks, and a leaderboard that makes grinding actually fun.
        </p>

        <div className="mt-10 flex gap-4 flex-wrap justify-center animate-fade-up delay-300">
          <Button onClick={() => openModal('signup')}>Start for Free →</Button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${t.secondaryBtn}`}>
            See Features
          </button>
        </div>

        <div className="mt-16 flex gap-12 flex-wrap justify-center animate-fade-up delay-400">
          {[['AI', 'Smart Plan Generator'], ['🔥', 'Streak System'], ['∞', 'Study Groups'], ['0₹', 'Free to Start']].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="font-syne font-extrabold text-3xl">{num}</div>
              <div className={`text-xs ${t.muted} mt-1`}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-20 px-12 max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#7c6aff] mb-4">Features</p>
        <h2 className="font-syne font-extrabold text-4xl tracking-tight max-w-lg leading-tight mb-14">Everything you need to actually study.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🤖', title: 'AI Study Plan Generator', desc: 'Paste your syllabus. AI builds your full day-by-day plan instantly.', tag: '🌟 USP', tagColor: 'text-[#7c6aff] bg-[#7c6aff]/10' },
            { icon: '🎮', title: 'Gamified Leaderboard', desc: 'Earn XP, maintain streaks, compete with your group. Like Duolingo for exams.', tag: '🌟 USP', tagColor: 'text-[#ff6a9b] bg-[#ff6a9b]/10' },
            { icon: '👥', title: 'Study Groups', desc: 'Create or join groups via invite link. Shared task boards keep everyone aligned.', tag: 'Collaboration', tagColor: 'text-[#6affd4] bg-[#6affd4]/10' },
            { icon: '📊', title: 'Progress Analytics', desc: "Visual charts showing who's on track and who's falling behind.", tag: 'Analytics', tagColor: 'text-[#7c6aff] bg-[#7c6aff]/10' },
            { icon: '⏰', title: 'Deadline Reminders', desc: "Smart reminders that adapt to your pace and warn you before it's too late.", tag: 'Smart Alerts', tagColor: 'text-[#ff6a9b] bg-[#ff6a9b]/10' },
            { icon: '🔥', title: 'Streak System', desc: 'Build daily habits with streaks. Miss a day and it resets — stay accountable.', tag: 'Habit Building', tagColor: 'text-[#6affd4] bg-[#6affd4]/10' },
          ].map(({ icon, title, desc, tag, tagColor }) => (
            <div key={title} className={`${t.cardBg} border rounded-2xl p-8 group ${t.tagCard} transition-all duration-300 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c6aff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-2xl mb-5">{icon}</div>
              <h3 className="font-syne font-bold text-base mb-2">{title}</h3>
              <p className={`${t.muted} text-sm leading-relaxed font-light`}>{desc}</p>
              <span className={`inline-block mt-4 text-xs font-semibold px-2.5 py-1 rounded-md ${tagColor}`}>{tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 py-20 px-12 max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#7c6aff] mb-4">How it works</p>
        <h2 className="font-syne font-extrabold text-4xl tracking-tight max-w-lg leading-tight mb-14">Up and running in minutes.</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            ['01', 'Sign Up Free', 'Create your account with email or Google. No credit card needed.'],
            ['02', 'Paste Your Syllabus', 'Drop in your exam schedule. AI generates your full study plan instantly.'],
            ['03', 'Invite Your Friends', "Share an invite link. See each other's progress on the shared board."],
            ['04', 'Compete & Complete', 'Earn XP, build streaks, top the leaderboard. Make exam prep addictive.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="flex flex-col gap-4">
              <div className={`font-syne font-extrabold text-5xl ${t.stepNum} transition-colors duration-300`}>{num}</div>
              <h3 className="font-syne font-bold text-base">{title}</h3>
              <p className={`${t.muted} text-sm leading-relaxed font-light`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`relative z-10 border-t ${isDark ? 'border-[#2a2a3d]' : 'border-gray-200'} px-12 py-10 flex items-center justify-between flex-wrap gap-6 transition-colors duration-300`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9b] flex items-center justify-center text-sm">⚡</div>
          <span className="font-syne font-extrabold">StudySync</span>
        </div>
        <p className={`${t.muted} text-sm`}>Built with ❤️ for college students · Chennai, India</p>
        <p className={`${t.muted} text-xs`}>© 2026 StudySync. All rights reserved.</p>
      </footer>

      {/* AUTH MODAL */}
      {modalOpen && (
        <div className={`fixed inset-0 ${t.overlayBg} backdrop-blur-sm z-[500] flex items-center justify-center animate-fade-in transition-colors duration-300`}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={`${t.modalBg} border rounded-3xl p-12 w-full max-w-md mx-6 relative animate-slide-up`}>
            <button onClick={closeModal}
              className={`absolute top-5 right-5 w-8 h-8 rounded-lg transition-all flex items-center justify-center text-lg ${t.closeBtn}`}>✕</button>

            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9b] flex items-center justify-center">⚡</div>
              <span className="font-syne font-extrabold text-lg">StudySync</span>
            </div>

            {/* Tabs */}
            <div className={`flex ${t.tabInactive} rounded-xl p-1 mb-7 gap-1 transition-colors duration-300`}>
              {['login', 'signup'].map(tp => (
                <button key={tp} onClick={() => { setTab(tp); setError('') }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all font-dm capitalize
                    ${tab === tp ? 'bg-[#7c6aff] text-white' : `${t.muted} hover:text-current`}`}>
                  {tp === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            {/* Form */}
            <div className="flex flex-col gap-4">
              {tab === 'signup' && (
                <div>
                  <label className={`text-xs ${t.label} uppercase tracking-wide mb-2 block`}>Full Name</label>
                  <input type="text" placeholder="Your name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] focus:ring-2 focus:ring-[#7c6aff]/20 transition-all ${t.inputBg}`} />
                </div>
              )}
              <div>
                <label className={`text-xs ${t.label} uppercase tracking-wide mb-2 block`}>Email address</label>
                <input type="email" placeholder="you@college.edu" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] focus:ring-2 focus:ring-[#7c6aff]/20 transition-all ${t.inputBg}`} />
              </div>
              <div>
                <label className={`text-xs ${t.label} uppercase tracking-wide mb-2 block`}>Password</label>
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] focus:ring-2 focus:ring-[#7c6aff]/20 transition-all ${t.inputBg}`} />
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full mt-1">
                {loading ? 'Please wait...' : tab === 'login' ? 'Login to StudySync →' : 'Create Free Account →'}
              </Button>

              <div className={`flex items-center gap-3 ${t.muted} text-xs`}>
                <div className={`flex-1 h-px ${t.divider}`} />or continue with<div className={`flex-1 h-px ${t.divider}`} />
              </div>

              <button onClick={handleGoogle}
                className={`w-full flex items-center justify-center gap-3 border rounded-xl py-3 text-sm font-medium font-dm transition-colors ${t.googleBtn}`}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
