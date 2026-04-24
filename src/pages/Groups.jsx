import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/layout/Sidebar'
import { Users, Plus, Copy, Trophy, Star, Check, Loader2, Crown, Medal, Award } from 'lucide-react'

export default function Groups() {
  const { user } = useAuth()
  const [groups, setGroups]         = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  const [members, setMembers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin]     = useState(false)
  const [groupName, setGroupName]   = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [creating, setCreating]     = useState(false)
  const [joining, setJoining]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => { if (user) fetchGroups() }, [user])

  const fetchGroups = async () => {
    setLoading(true)
    const { data } = await supabase.from('group_members')
      .select('group_id, groups(id,name,invite_code,created_by,created_at)').eq('user_id', user.id)
    const g = data?.map(d=>d.groups).filter(Boolean) || []
    setGroups(g)
    if (g.length > 0) { setActiveGroup(g[0]); fetchMembers(g[0].id) }
    setLoading(false)
  }

  const fetchMembers = async (groupId) => {
    setMembersLoading(true)
    const { data } = await supabase.from('group_members')
      .select('user_id, joined_at, profiles(id,full_name,email,xp,streak)').eq('group_id', groupId)
    const m = data?.map(d=>({...d.profiles, joined_at:d.joined_at})).filter(Boolean) || []
    m.sort((a,b) => (b.xp||0)-(a.xp||0))
    setMembers(m); setMembersLoading(false)
  }

  const createGroup = async () => {
    if (!groupName.trim()) return
    setCreating(true); setError('')
    try {
      const { data: group, error: gErr } = await supabase.from('groups')
        .insert({ name: groupName.trim(), created_by: user.id }).select().single()
      if (gErr) throw gErr
      await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })
      setGroups(p=>[...p,group]); setActiveGroup(group); fetchMembers(group.id)
      setGroupName(''); setShowCreate(false)
    } catch(e) { setError(e.message||'Failed to create group') }
    finally { setCreating(false) }
  }

  const joinGroup = async () => {
    if (!inviteCode.trim()) return
    setJoining(true); setError('')
    try {
      const { data: group, error: gErr } = await supabase.from('groups').select('*').eq('invite_code', inviteCode.trim().toLowerCase()).single()
      if (gErr||!group) throw new Error('Group not found. Check the invite code.')
      const { data: existing } = await supabase.from('group_members').select('id').eq('group_id',group.id).eq('user_id',user.id).single()
      if (existing) throw new Error('You are already in this group!')
      await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })
      setGroups(p=>[...p,group]); setActiveGroup(group); fetchMembers(group.id)
      setInviteCode(''); setShowJoin(false)
    } catch(e) { setError(e.message||'Failed to join group') }
    finally { setJoining(false) }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(activeGroup?.invite_code)
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }

  const rankIcon = (i) => {
    if (i===0) return <Crown size={18} className="text-yellow-400" />
    if (i===1) return <Medal size={18} className="text-gray-300" />
    if (i===2) return <Award size={18} className="text-amber-600" />
    return <span style={{ color:'var(--muted)' }} className="text-sm font-bold w-[18px] text-center">#{i+1}</span>
  }

  return (
    <div style={{ background:'var(--bg)', color:'var(--text)' }} className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-syne font-extrabold text-3xl tracking-tight mb-1">Study Groups</h1>
              <p style={{ color:'var(--muted)' }} className="text-sm">Study together, compete together, grow together.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>{setShowJoin(true);setShowCreate(false);setError('')}}
                style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                className="flex items-center gap-2 border text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
                <Plus size={16} /> Join Group
              </button>
              <button onClick={()=>{setShowCreate(true);setShowJoin(false);setError('')}}
                className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:-translate-y-0.5 transition-all"
                style={{ background:'linear-gradient(135deg,var(--accent),#5a48e0)', boxShadow:'0 4px 20px rgba(124,106,255,0.2)' }}>
                <Users size={16} /> Create Group
              </button>
            </div>
          </div>

          {/* Create / Join form */}
          {(showCreate||showJoin) && (
            <div style={{ background:'var(--card)', borderColor:'rgba(124,106,255,0.2)' }} className="border rounded-2xl p-6 mb-6 animate-fade-up">
              <h3 className="font-syne font-bold text-base mb-4">{showCreate ? '🆕 Create a New Group' : '🔗 Join a Group'}</h3>
              {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              <div className="flex gap-3">
                <input autoFocus value={showCreate ? groupName : inviteCode}
                  onChange={e => showCreate ? setGroupName(e.target.value) : setInviteCode(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && (showCreate ? createGroup() : joinGroup())}
                  placeholder={showCreate ? 'e.g. CS 2023 Batch...' : 'Enter 8-character invite code'}
                  style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                  className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6aff] placeholder:opacity-50 transition-all" />
                <button onClick={showCreate ? createGroup : joinGroup} disabled={creating||joining}
                  className="flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 text-sm"
                  style={{ background:'linear-gradient(135deg,var(--accent),#5a48e0)' }}>
                  {(creating||joining) ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {showCreate ? (creating?'Creating...':'Create') : (joining?'Joining...':'Join')}
                </button>
                <button onClick={()=>{setShowCreate(false);setShowJoin(false);setError('')}}
                  style={{ borderColor:'var(--border)', color:'var(--muted)' }}
                  className="px-4 py-3 rounded-xl border text-sm transition-all">Cancel</button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ color:'var(--muted)' }} className="text-center py-20 text-sm">Loading groups...</div>
          ) : groups.length===0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="font-syne font-bold text-xl mb-2">No groups yet</h2>
              <p style={{ color:'var(--muted)' }} className="text-sm mb-6 max-w-sm mx-auto">Create a group and share the invite code with your friends.</p>
              <button onClick={()=>setShowCreate(true)} className="text-white font-semibold px-6 py-3 rounded-xl hover:-translate-y-0.5 transition-all"
                style={{ background:'linear-gradient(135deg,var(--accent),#5a48e0)' }}>Create Your First Group</button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Group list */}
              <div className="col-span-4 flex flex-col gap-3">
                <p style={{ color:'var(--muted)' }} className="text-xs uppercase tracking-widest font-semibold mb-1">Your Groups</p>
                {groups.map(g => (
                  <button key={g.id} onClick={()=>{setActiveGroup(g);fetchMembers(g.id)}}
                    style={{
                      background: activeGroup?.id===g.id ? 'rgba(124,106,255,0.1)' : 'var(--card)',
                      borderColor: activeGroup?.id===g.id ? 'rgba(124,106,255,0.3)' : 'var(--border)',
                      color: activeGroup?.id===g.id ? 'var(--text)' : 'var(--muted)',
                    }}
                    className="text-left p-4 rounded-2xl border transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ background: activeGroup?.id===g.id ? 'var(--accent)' : 'var(--surface2)', color: activeGroup?.id===g.id ? '#fff' : 'var(--muted)' }}>
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color:'var(--text)' }} className="text-sm font-semibold truncate">{g.name}</p>
                        <p style={{ color:'var(--muted)' }} className="text-xs mt-0.5">Code: {g.invite_code}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active group detail */}
              <div className="col-span-8 flex flex-col gap-5">
                {activeGroup && (
                  <>
                    <div style={{ background:'var(--card)', borderColor:'var(--border)' }} className="border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="font-syne font-bold text-xl">{activeGroup.name}</h2>
                          <p style={{ color:'var(--muted)' }} className="text-sm mt-0.5">{members.length} members</p>
                        </div>
                        <div className="text-right">
                          <p style={{ color:'var(--muted)' }} className="text-xs mb-1">Invite Code</p>
                          <button onClick={copyCode}
                            style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--text)' }}
                            className="flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-mono font-semibold transition-all">
                            {copied ? <Check size={14} style={{ color:'var(--accent3)' }} /> : <Copy size={14} style={{ color:'var(--muted)' }} />}
                            {activeGroup.invite_code}
                          </button>
                          {copied && <p style={{ color:'var(--accent3)' }} className="text-xs mt-1">Copied! 🎉</p>}
                        </div>
                      </div>
                      <div style={{ background:'var(--surface2)', borderColor:'var(--border)', color:'var(--muted)' }}
                        className="p-3 rounded-xl border text-xs">
                        💡 Share the code with friends. They join via <strong style={{ color:'var(--text)' }}>"Join Group"</strong>.
                      </div>
                    </div>

                    {/* Leaderboard */}
                    <div style={{ background:'var(--card)', borderColor:'var(--border)' }} className="border rounded-2xl overflow-hidden">
                      <div style={{ borderColor:'var(--border)' }} className="flex items-center gap-2 px-6 py-4 border-b">
                        <Trophy size={18} className="text-yellow-400" />
                        <h3 className="font-syne font-bold text-base">Leaderboard</h3>
                      </div>
                      {membersLoading ? (
                        <div style={{ color:'var(--muted)' }} className="text-center py-10 text-sm">Loading members...</div>
                      ) : members.length===0 ? (
                        <div style={{ color:'var(--muted)' }} className="text-center py-10 text-sm">No members yet</div>
                      ) : (
                        <div>
                          {members.map((m,i) => {
                            const isMe = m.id===user.id
                            const xp   = m.xp||0
                            const lv   = Math.floor(xp/500)+1
                            const name = m.full_name||m.email?.split('@')[0]||'Student'
                            const ini  = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
                            return (
                              <div key={m.id}
                                style={{
                                  borderBottom:'1px solid var(--border)',
                                  background: i===0 ? 'rgba(251,191,36,0.04)' : isMe ? 'rgba(124,106,255,0.04)' : 'transparent'
                                }}
                                className="flex items-center gap-4 px-6 py-4">
                                <div className="w-8 flex items-center justify-center flex-shrink-0">{rankIcon(i)}</div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                  style={{ background: i===0 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : i===1 ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : i===2 ? 'linear-gradient(135deg,#b45309,#92400e)' : 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                                  {ini}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p style={{ color:'var(--text)' }} className="text-sm font-semibold truncate">{name}</p>
                                    {isMe && <span style={{ background:'rgba(124,106,255,0.1)', color:'var(--accent)', border:'1px solid rgba(124,106,255,0.2)' }} className="text-xs px-2 py-0.5 rounded-full">You</span>}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span style={{ color:'var(--muted)' }} className="text-xs">Level {lv}</span>
                                    <span className="text-xs text-orange-400">🔥 {m.streak||0} streak</span>
                                  </div>
                                </div>
                                <div className="w-28 hidden md:block">
                                  <div style={{ background:'var(--surface2)' }} className="h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width:`${Math.min((xp%500)/500*100,100)}%`, background: i===0 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,var(--accent),var(--accent2))' }} />
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="flex items-center gap-1">
                                    <Star size={12} style={{ color:'var(--accent2)' }} />
                                    <span className="font-syne font-bold text-sm">{xp.toLocaleString()}</span>
                                  </div>
                                  <p style={{ color:'var(--muted)' }} className="text-xs">XP</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
