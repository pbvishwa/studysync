import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/layout/Sidebar'
import { Sparkles, BookOpen, Calendar, ChevronRight, Loader2, CheckCircle2, Plus } from 'lucide-react'

const EXAMPLE = `Subjects & Topics:
1. Mathematics - Calculus, Matrices, Probability
2. Physics - Optics, Electrostatics, Modern Physics
3. Computer Science - Data Structures, DBMS, OS, Networks
4. English - Essay Writing, Comprehension, Grammar

Exam Schedule:
- Mathematics: May 10
- Physics: May 13
- Computer Science: May 16
- English: May 18`

const diffColor = { easy:'var(--accent3)', medium:'var(--accent)', hard:'var(--accent2)' }
const diffBg    = { easy:'rgba(106,255,212,0.1)', medium:'rgba(124,106,255,0.1)', hard:'rgba(255,106,155,0.1)' }

export default function Planner() {
  const { user } = useAuth()
  const [syllabus, setSyllabus] = useState('')
  const [examDate, setExamDate] = useState('')
  const [hours, setHours]       = useState('4')
  const [plan, setPlan]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [step, setStep]         = useState(1)
  const today = new Date().toISOString().split('T')[0]

  const generate = async () => {
    if (!syllabus.trim()) return
    setLoading(true); setError(''); setPlan(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 4000,
          messages: [{ role: 'user', content: `You are a study plan generator for college students.

Syllabus: ${syllabus}
Study hours/day: ${hours}
Today: ${today}
${examDate ? `Main exam date: ${examDate}` : ''}

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "...",
  "summary": "...",
  "totalDays": <number>,
  "totalTasks": <number>,
  "days": [
    {
      "date": "YYYY-MM-DD",
      "label": "Day 1 - Topic",
      "tasks": [
        { "title": "...", "subject": "...", "difficulty": "easy|medium|hard", "estimatedMinutes": <number>, "xp_reward": 30|60|100 }
      ]
    }
  ]
}
Rules: xp_reward=30 easy, 60 medium, 100 hard. Specific actionable tasks. 5-21 days. 2-4 tasks/day.` }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse plan')
      setPlan(JSON.parse(match[0])); setStep(2)
    } catch { setError('Failed to generate plan. Please try again.') }
    finally { setLoading(false) }
  }

  const savePlan = async () => {
    if (!plan || !user) return
    setSaving(true)
    try {
      const rows = plan.days.flatMap(day => day.tasks.map(t => ({
        user_id: user.id, title: t.title, subject: t.subject,
        due_date: day.date, xp_reward: t.xp_reward, is_completed: false,
      })))
      const { error } = await supabase.from('tasks').insert(rows)
      if (error) throw error
      setSaved(true)
    } catch { setError('Failed to save tasks.') }
    finally { setSaving(false) }
  }

  const totalXp = plan?.days.reduce((a,d) => a + d.tasks.reduce((b,t) => b + t.xp_reward, 0), 0) || 0

  return (
    <div style={{ background:'var(--bg)', color:'var(--text)' }} className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pt-0 md:pb-0 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-2" style={{ color:'var(--accent)' }}>
              <Sparkles size={13} /> AI-Powered
            </div>
            <h1 className="font-syne font-extrabold text-2xl md:text-3xl tracking-tight mb-1">Study Planner</h1>
            <p style={{ color:'var(--muted)' }} className="text-sm">Paste your syllabus — AI builds your complete study plan.</p>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-3 mb-6">
            {[['1','Enter Syllabus'],['2','Review Plan']].map(([num,label],i) => (
              <div key={num} className="flex items-center gap-2">
                <div className="flex items-center gap-2" style={{ color: step>=+num ? 'var(--text)' : 'var(--muted)' }}>
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: step>=+num ? 'var(--accent)' : 'var(--surface2)', color: step>=+num ? '#fff' : 'var(--muted)', border:`1px solid ${step>=+num?'var(--accent)':'var(--border)'}` }}>
                    {step>+num ? '✓' : num}
                  </div>
                  <span className="text-xs md:text-sm font-medium">{label}</span>
                </div>
                {i===0 && <ChevronRight size={14} style={{ color:'var(--border)' }} />}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step===1 && (
            <div className="space-y-4">
              <div style={{ background:'var(--card)', borderColor:'var(--border)' }} className="border rounded-2xl p-4 md:p-6">
                <label style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-wide mb-3 block font-semibold">📄 Syllabus / Exam Schedule</label>
                <textarea value={syllabus} onChange={e=>setSyllabus(e.target.value)} placeholder={EXAMPLE} rows={10}
                  style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none font-mono placeholder:opacity-40 focus:border-[#7c6aff]" />
                <p style={{ color:'var(--muted)' }} className="text-xs mt-2">Include subjects, topics, and exam dates for best results.</p>
              </div>

              {/* Options — stacked on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div style={{ background:'var(--card)', borderColor:'var(--border)' }} className="border rounded-2xl p-4 md:p-6">
                  <label style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-wide mb-3 block font-semibold flex items-center gap-2"><Calendar size={12} /> Exam Date (optional)</label>
                  <input type="date" value={examDate} min={today} onChange={e=>setExamDate(e.target.value)}
                    style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] transition-all" />
                </div>
                <div style={{ background:'var(--card)', borderColor:'var(--border)' }} className="border rounded-2xl p-4 md:p-6">
                  <label style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-wide mb-3 block font-semibold flex items-center gap-2"><BookOpen size={12} /> Study Hours/Day</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['2','4','6','8'].map(h => (
                      <button key={h} onClick={()=>setHours(h)}
                        style={{ borderColor: hours===h ? 'var(--accent)' : 'var(--border)', background: hours===h ? 'rgba(124,106,255,0.1)' : 'var(--surface2)', color:'var(--text)' }}
                        className="py-2.5 rounded-xl text-sm font-semibold border transition-all">{h}h</button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={()=>setSyllabus(EXAMPLE)} style={{ color:'var(--accent)' }} className="text-xs hover:underline flex items-center gap-1">
                <Plus size={11} /> Load example syllabus
              </button>

              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

              <button onClick={generate} disabled={loading||!syllabus.trim()}
                className="w-full py-4 rounded-2xl text-white font-syne font-bold text-base md:text-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                style={{ background:'linear-gradient(135deg,var(--accent),#5a48e0)', boxShadow:'0 4px 20px rgba(124,106,255,0.25)' }}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate AI Study Plan</>}
              </button>
              {loading && <p style={{ color:'var(--muted)' }} className="text-center text-sm animate-pulse">🤖 Claude is analyzing your syllabus...</p>}
            </div>
          )}

          {/* STEP 2 */}
          {step===2 && plan && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="border rounded-2xl p-4 md:p-6" style={{ background:'rgba(124,106,255,0.06)', borderColor:'rgba(124,106,255,0.2)' }}>
                <h2 className="font-syne font-bold text-lg md:text-xl mb-1">{plan.title}</h2>
                <p style={{ color:'var(--muted)' }} className="text-sm mb-4">{plan.summary}</p>
                <div className="flex gap-4">
                  {[['Days', plan.totalDays, 'var(--accent)'],['Tasks', plan.totalTasks, 'var(--accent2)'],['XP', totalXp.toLocaleString(), 'var(--accent3)']].map(([l,v,c])=>(
                    <div key={l}><p className="font-syne font-extrabold text-xl md:text-2xl" style={{ color:c }}>{v}</p><p style={{ color:'var(--muted)' }} className="text-xs">{l}</p></div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={()=>{setStep(1);setSaved(false);setPlan(null)}}
                  style={{ borderColor:'var(--border)', color:'var(--muted)' }}
                  className="flex-1 py-3 rounded-xl border text-sm font-medium">← Regenerate</button>
                <button onClick={savePlan} disabled={saving||saved}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: saved ? 'rgba(106,255,212,0.15)' : 'linear-gradient(135deg,var(--accent),#5a48e0)', color: saved ? 'var(--accent3)' : '#fff', border: saved ? '1px solid rgba(106,255,212,0.3)' : 'none' }}>
                  {saved ? <><CheckCircle2 size={15} /> Saved!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Plus size={15} /> Save to Dashboard</>}
                </button>
              </div>
              {saved && <p style={{ color:'var(--accent3)' }} className="text-center text-sm">🎉 All {plan.totalTasks} tasks saved! Go to Dashboard to start.</p>}

              {/* Day cards */}
              <div className="space-y-3">
                {plan.days.map((day,i) => (
                  <div key={i} style={{ background:'var(--card)', borderColor:'var(--border)' }} className="border rounded-2xl overflow-hidden">
                    <div style={{ background:'var(--surface2)', borderColor:'var(--border)' }} className="flex items-center justify-between px-4 py-3 border-b">
                      <div>
                        <p className="font-syne font-bold text-sm">{day.label}</p>
                        <p style={{ color:'var(--muted)' }} className="text-xs mt-0.5">{new Date(day.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color:'var(--accent)' }}>+{day.tasks.reduce((a,t)=>a+t.xp_reward,0)} XP</p>
                        <p style={{ color:'var(--muted)' }} className="text-xs">{day.tasks.length} tasks</p>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      {day.tasks.map((task,j) => (
                        <div key={j} style={{ background:'var(--surface2)' }} className="flex items-center gap-3 p-3 rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'var(--accent)' }} />
                          <div className="flex-1 min-w-0">
                            <p style={{ color:'var(--text)' }} className="text-sm">{task.title}</p>
                            <p style={{ color:'var(--muted)' }} className="text-xs mt-0.5">{task.subject} · ~{task.estimatedMinutes}min</p>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg capitalize hidden sm:inline"
                            style={{ color:diffColor[task.difficulty], background:diffBg[task.difficulty] }}>{task.difficulty}</span>
                          <span className="text-xs font-semibold flex-shrink-0" style={{ color:'var(--accent3)' }}>+{task.xp_reward}XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
