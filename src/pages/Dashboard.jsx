import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/layout/Sidebar'
import { Plus, Trash2, CheckCircle2, Circle, Flame, Trophy, Star, BookOpen } from 'lucide-react'

const SUBJECTS = ['Mathematics','Physics','Chemistry','Computer Science','English','History','Biology','Other']
const XP_REWARD = { easy: 30, medium: 60, hard: 100 }

const Card = ({ children, className = '', style = {} }) => (
  <div style={{ background: 'var(--card)', borderColor: 'var(--border)', ...style }}
    className={`border rounded-2xl ${className}`}>{children}</div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile]         = useState(null)
  const [tasks, setTasks]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask]         = useState({ title: '', subject: 'Mathematics', due_date: '', difficulty: 'medium' })
  const [adding, setAdding]           = useState(false)
  const [xpFlash, setXpFlash]         = useState(null)

  const name     = profile?.full_name || user?.email?.split('@')[0] || 'Student'
  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
  }, [user])

  useEffect(() => { if (user) fetchTasks() }, [user])

  const fetchTasks = async () => {
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return
    setAdding(true)
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id, title: newTask.title, subject: newTask.subject,
      due_date: newTask.due_date || null, xp_reward: XP_REWARD[newTask.difficulty], is_completed: false,
    }).select().single()
    if (!error && data) { setTasks(p => [data, ...p]); setNewTask({ title: '', subject: 'Mathematics', due_date: '', difficulty: 'medium' }); setShowAddTask(false) }
    setAdding(false)
  }

  const completeTask = async (task) => {
    if (task.is_completed) return
    await supabase.from('tasks').update({ is_completed: true }).eq('id', task.id)
    const newXp = (profile?.xp || 0) + task.xp_reward
    await supabase.from('profiles').update({ xp: newXp, last_active: todayStr }).eq('id', user.id)
    setTasks(p => p.map(t => t.id === task.id ? { ...t, is_completed: true } : t))
    setProfile(p => ({ ...p, xp: newXp }))
    setXpFlash(`+${task.xp_reward} XP!`)
    setTimeout(() => setXpFlash(null), 2000)
  }

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(p => p.filter(t => t.id !== id))
  }

  const todayTasks     = tasks.filter(t => t.due_date === todayStr || !t.due_date)
  const completedToday = todayTasks.filter(t => t.is_completed).length
  const totalToday     = todayTasks.length
  const progress       = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
  const xp             = profile?.xp || 0
  const level          = Math.floor(xp / 500) + 1
  const xpInLevel      = xp % 500
  const xpProgress     = Math.round((xpInLevel / 500) * 100)
  const pending        = tasks.filter(t => !t.is_completed)
  const completed      = tasks.filter(t => t.is_completed)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }} className="flex min-h-screen">
      <Sidebar profile={profile} />

      {/* main: on mobile add top+bottom padding for fixed bars */}
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pt-0 md:pb-0 p-4 md:p-8 relative">

        {/* XP Flash */}
        {xpFlash && (
          <div className="fixed top-20 right-4 md:top-8 md:right-8 z-50 font-syne font-bold text-lg px-5 py-3 rounded-2xl animate-slide-up shadow-lg"
            style={{ background: 'rgba(106,255,212,0.15)', border: '1px solid rgba(106,255,212,0.3)', color: 'var(--accent3)' }}>
            {xpFlash} ⚡
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p style={{ color: 'var(--muted)' }} className="text-xs md:text-sm mb-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="font-syne font-extrabold text-2xl md:text-3xl tracking-tight">Hey, {name}! 👋</h1>
            </div>
            <button onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 text-white font-semibold px-3 py-2 md:px-5 md:py-2.5 rounded-xl hover:-translate-y-0.5 transition-all text-sm"
              style={{ background: 'linear-gradient(135deg,var(--accent),#5a48e0)', boxShadow: '0 4px 20px rgba(124,106,255,0.25)' }}>
              <Plus size={16} /> <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>

          {/* Stat Cards — 2 col on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <BookOpen size={14} style={{ color:'var(--accent)' }} />,  label:"Today's Tasks", value:`${completedToday}/${totalToday}`, sub:`${progress}% done`,    bar: progress,   barColor:'var(--accent)' },
              { icon: <Star size={14} style={{ color:'var(--accent2)' }} />,      label:'Total XP',      value: xp.toLocaleString(),            sub:`Level ${level}`,        bar: null },
              { icon: <Trophy size={14} style={{ color:'var(--accent3)' }} />,    label:'Level',         value:`Lv.${level}`,                   sub:`${xpInLevel}/500 XP`,   bar: xpProgress, barColor:'var(--accent3)' },
              { icon: <Flame size={14} className="text-orange-400" />,            label:'Streak',        value:`${profile?.streak||0} 🔥`,      sub:'Days in a row',         bar: null },
            ].map(({ icon, label, value, sub, bar, barColor }) => (
              <Card key={label} className="p-4">
                <div className="flex items-center gap-1.5 mb-2">{icon}<p style={{ color:'var(--muted)' }} className="text-xs truncate">{label}</p></div>
                <p className="font-syne font-extrabold text-xl md:text-2xl">{value}</p>
                {bar !== null && bar !== undefined && (
                  <div style={{ background:'var(--surface2)' }} className="mt-2 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width:`${bar}%`, background: barColor }} />
                  </div>
                )}
                <p style={{ color:'var(--muted)' }} className="text-xs mt-1">{sub}</p>
              </Card>
            ))}
          </div>

          {/* Add Task Modal */}
          {showAddTask && (
            <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-fade-in"
              style={{ background:'rgba(0,0,0,0.6)' }}
              onClick={e => e.target === e.currentTarget && setShowAddTask(false)}>
              {/* Slides up from bottom on mobile */}
              <div style={{ background:'var(--surface)', borderColor:'var(--border)' }}
                className="border rounded-t-3xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-md animate-slide-up">
                <div className="w-10 h-1 rounded-full mx-auto mb-5 md:hidden" style={{ background:'var(--border)' }} />
                <h2 className="font-syne font-bold text-xl mb-5">➕ Add New Task</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-wide mb-2 block">Task Title</label>
                    <input autoFocus value={newTask.title} onChange={e => setNewTask(p=>({...p,title:e.target.value}))}
                      onKeyDown={e => e.key==='Enter' && addTask()} placeholder="e.g. Complete Chapter 5 notes"
                      style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] transition-all placeholder:opacity-50" />
                  </div>
                  <div>
                    <label style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-wide mb-2 block">Subject</label>
                    <select value={newTask.subject} onChange={e => setNewTask(p=>({...p,subject:e.target.value}))}
                      style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] transition-all">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-wide mb-2 block">Due Date (optional)</label>
                    <input type="date" value={newTask.due_date} min={todayStr} onChange={e => setNewTask(p=>({...p,due_date:e.target.value}))}
                      style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] transition-all" />
                  </div>
                  <div>
                    <label style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-wide mb-2 block">Difficulty & XP</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[['easy','30 XP','var(--accent3)'],['medium','60 XP','var(--accent)'],['hard','100 XP','var(--accent2)']].map(([d,xpLabel,col]) => (
                        <button key={d} onClick={() => setNewTask(p=>({...p,difficulty:d}))}
                          style={{ borderColor: newTask.difficulty===d ? 'var(--accent)' : 'var(--border)', background: newTask.difficulty===d ? 'rgba(124,106,255,0.1)' : 'transparent', color:'var(--text)' }}
                          className="py-2.5 rounded-xl text-sm font-medium border transition-all capitalize">
                          {d}<br/><span style={{ color:col, fontSize:'11px' }}>{xpLabel}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <button onClick={() => setShowAddTask(false)}
                      style={{ borderColor:'var(--border)', color:'var(--muted)' }}
                      className="flex-1 py-3 rounded-xl border text-sm font-medium">Cancel</button>
                    <button onClick={addTask} disabled={adding||!newTask.title.trim()}
                      className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
                      style={{ background:'linear-gradient(135deg,var(--accent),#5a48e0)' }}>
                      {adding ? 'Adding...' : 'Add Task ✓'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task List */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-base md:text-lg">📚 My Tasks</h2>
              <span style={{ color:'var(--muted)' }} className="text-xs">{pending.length} pending · {completed.length} done</span>
            </div>
            {loading ? (
              <div style={{ color:'var(--muted)' }} className="text-center py-10 text-sm">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📝</div>
                <p style={{ color:'var(--muted)' }} className="text-sm mb-4">No tasks yet! Add your first task.</p>
                <button onClick={() => setShowAddTask(true)} style={{ color:'var(--accent)' }} className="text-sm font-medium hover:underline">+ Add your first task</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map(task => <TaskItem key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />)}
                {completed.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 my-2">
                      <div style={{ background:'var(--border)' }} className="flex-1 h-px" />
                      <span style={{ color:'var(--muted)' }} className="text-xs">Completed ({completed.length})</span>
                      <div style={{ background:'var(--border)' }} className="flex-1 h-px" />
                    </div>
                    {completed.map(task => <TaskItem key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />)}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

function TaskItem({ task, onComplete, onDelete }) {
  const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0] && !task.is_completed
  return (
    <div style={{ background:'var(--surface2)', borderColor:'var(--border)' }}
      className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border transition-all group ${task.is_completed ? 'opacity-60' : ''}`}>
      <button onClick={() => onComplete(task)} className="flex-shrink-0 transition-transform hover:scale-110">
        {task.is_completed
          ? <CheckCircle2 size={20} style={{ color:'var(--accent3)' }} />
          : <Circle size={20} style={{ color:'var(--muted)' }} />}
      </button>
      <div className="flex-1 min-w-0">
        <p style={{ color: task.is_completed ? 'var(--muted)' : 'var(--text)' }}
          className={`text-sm font-medium ${task.is_completed ? 'line-through' : ''}`}>{task.title}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <span style={{ color:'var(--muted)' }} className="text-xs">{task.subject}</span>
          {task.due_date && (
            <span className={`text-xs ${isOverdue ? 'text-red-400' : ''}`} style={!isOverdue ? { color:'var(--muted)' } : {}}>
              · {isOverdue ? '⚠️ Overdue' : `Due ${new Date(task.due_date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`}
            </span>
          )}
        </div>
      </div>
      <span style={{ color:'var(--accent3)', background:'rgba(106,255,212,0.1)' }} className="text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0">
        +{task.xp_reward} XP
      </span>
      <button onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 md:block hidden text-red-400 transition-all p-1 flex-shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  )
}
