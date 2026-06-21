import { useState, useEffect } from 'react'
import { Target, PlusCircle, CheckCircle2, Trash2, ChevronDown, ChevronUp, Shield } from 'lucide-react'

function loadGoals() {
  try { return JSON.parse(localStorage.getItem('va_goals') || '[]') } catch { return [] }
}

function loadCR() {
  try { return JSON.parse(localStorage.getItem('va_cr') || '{}') } catch { return {} }
}

const CATEGORIES = ['Spiritual', 'Physical', 'Financial', 'Relational', 'Creational', 'Professional', 'Generational']

const DOMAIN_ICONS = ['✝', '💪', '💰', '❤', '🎨', '💼', '🏛']

function crStatus(pct) {
  if (pct >= 80) return { label: 'COMBAT READY', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' }
  if (pct >= 60) return { label: 'OPERATIONAL', color: 'text-[#f5c842]', bg: 'bg-[#f5c842]/10 border-[#f5c842]/30' }
  if (pct >= 40) return { label: 'DEGRADED', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' }
  return { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' }
}

function RadarChart({ scores }) {
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 60
  const n = CATEGORIES.length

  const angleOf = i => (Math.PI * 2 * i) / n - Math.PI / 2

  const gridLevels = [0.25, 0.5, 0.75, 1]

  const gridPolygon = (level) =>
    CATEGORIES.map((_, i) => {
      const a = angleOf(i)
      return `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`
    }).join(' ')

  const dataPolygon = CATEGORIES.map((cat, i) => {
    const val = (scores[cat] || 0) / 10
    const a = angleOf(i)
    return `${cx + r * val * Math.cos(a)},${cy + r * val * Math.sin(a)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* Grid */}
      {gridLevels.map(level => (
        <polygon key={level} points={gridPolygon(level)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}
      {/* Spokes */}
      {CATEGORIES.map((_, i) => {
        const a = angleOf(i)
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      })}
      {/* Data */}
      <polygon points={dataPolygon} fill="rgba(245,200,66,0.15)" stroke="#f5c842" strokeWidth="1.5" strokeLinejoin="round" />
      {CATEGORIES.map((cat, i) => {
        const val = (scores[cat] || 0) / 10
        const a = angleOf(i)
        return <circle key={i} cx={cx + r * val * Math.cos(a)} cy={cy + r * val * Math.sin(a)} r="3" fill="#f5c842" />
      })}
      {/* Labels */}
      {CATEGORIES.map((cat, i) => {
        const a = angleOf(i)
        const lx = cx + (r + 18) * Math.cos(a)
        const ly = cy + (r + 18) * Math.sin(a)
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Rajdhani, sans-serif">
            {cat.slice(0, 3).toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

function CombatReadiness() {
  const [scores, setScores] = useState(loadCR)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(loadCR)

  const filled = CATEGORIES.filter(c => scores[c] > 0)
  const avg = filled.length
    ? Math.round((filled.reduce((s, c) => s + scores[c], 0) / filled.length) * 10)
    : 0
  const status = crStatus(avg)

  const save = () => {
    setScores(draft)
    localStorage.setItem('va_cr', JSON.stringify(draft))
    setEditing(false)
  }

  return (
    <div className="card-glass rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={14} strokeWidth={1.5} className="gold-text" />
          <p className="font-military tracking-widest text-sm gold-text">COMBAT READINESS</p>
        </div>
        <button
          onClick={() => { setDraft(scores); setEditing(e => !e) }}
          className="text-white/30 hover:text-[#f5c842] text-[10px] font-military tracking-widest transition-colors"
        >
          {editing ? 'CANCEL' : 'UPDATE'}
        </button>
      </div>

      {!editing ? (
        <div className="flex items-center gap-6">
          <RadarChart scores={scores} />
          <div className="flex-1 space-y-3">
            <div>
              <p className="font-military text-4xl gold-text">{avg}%</p>
              <span className={`inline-block mt-1 text-[10px] font-military tracking-widest px-2 py-0.5 rounded border ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="space-y-1.5">
              {CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-white/30 text-[10px] font-military w-16 truncate">{cat.slice(0,4).toUpperCase()}</span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(scores[cat] || 0) * 10}%`, background: 'linear-gradient(90deg,#c9972b,#f5c842)' }} />
                  </div>
                  <span className="text-white/30 text-[10px] font-body w-4 text-right">{scores[cat] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-white/30 text-xs font-body">Rate each domain 1–10</p>
          {CATEGORIES.map((cat, i) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-white/50 text-xs font-military w-24 shrink-0">{cat}</span>
              <input
                type="range" min="0" max="10" step="1"
                value={draft[cat] || 0}
                onChange={e => setDraft(d => ({ ...d, [cat]: Number(e.target.value) }))}
                className="flex-1 accent-[#f5c842]"
              />
              <span className="font-military text-sm gold-text w-4 text-right">{draft[cat] || 0}</span>
            </div>
          ))}
          <button onClick={save} className="btn-gold w-full text-sm mt-2">SAVE ASSESSMENT</button>
        </div>
      )}
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState(loadGoals)
  const [adding, setAdding] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm] = useState({ title: '', category: 'Spiritual', deadline: '', milestones: [''] })

  useEffect(() => { localStorage.setItem('va_goals', JSON.stringify(goals)) }, [goals])

  const addGoal = () => {
    if (!form.title.trim()) return
    setGoals(prev => [...prev, {
      id: Date.now(),
      ...form,
      milestones: form.milestones.filter(m => m.trim()).map(m => ({ text: m, done: false })),
      createdAt: new Date().toISOString(),
    }])
    setForm({ title: '', category: 'Spiritual', deadline: '', milestones: [''] })
    setAdding(false)
  }

  const toggleMilestone = (goalId, mi) => {
    setGoals(prev => prev.map(g => g.id !== goalId ? g : {
      ...g,
      milestones: g.milestones.map((m, i) => i === mi ? { ...m, done: !m.done } : m)
    }))
  }

  const deleteGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id))

  const progress = (g) => {
    if (!g.milestones.length) return 0
    return Math.round((g.milestones.filter(m => m.done).length / g.milestones.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="font-military text-3xl gold-gradient tracking-widest">OBJECTIVES</h1>
        <p className="text-white/40 text-xs tracking-widest font-body uppercase">{goals.length} active campaigns</p>
      </div>

      <CombatReadiness />

      {goals.length === 0 && !adding && (
        <div className="card-glass rounded-2xl p-8 text-center space-y-2">
          <Target size={40} className="text-[#f5c842] mx-auto" />
          <p className="font-semibold">No goals yet</p>
          <p className="text-white/40 text-sm">Set your first goal and take command.</p>
        </div>
      )}

      <div className="space-y-3">
        {goals.map(goal => {
          const pct = progress(goal)
          const open = expanded === goal.id
          return (
            <div key={goal.id} className="card-glass rounded-xl overflow-hidden">
              <button
                className="w-full px-4 py-4 flex items-center gap-3 text-left"
                onClick={() => setExpanded(open ? null : goal.id)}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{goal.title}</p>
                    <span className="text-[#f5c842] text-xs shrink-0">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#f5c842,#f5c842)' }} />
                  </div>
                  <div className="flex gap-2 text-xs text-white/40">
                    <span>{goal.category}</span>
                    {goal.deadline && <span>· Due {new Date(goal.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                {open ? <ChevronUp size={16} className="text-white/30 shrink-0" /> : <ChevronDown size={16} className="text-white/30 shrink-0" />}
              </button>

              {open && (
                <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3">
                  {goal.milestones.map((m, i) => (
                    <button key={i} onClick={() => toggleMilestone(goal.id, i)} className="flex items-center gap-3 w-full text-left">
                      <CheckCircle2 size={16} className={m.done ? 'text-[#f5c842]' : 'text-white/20'} />
                      <span className={`text-sm ${m.done ? 'line-through text-white/30' : 'text-white/80'}`}>{m.text}</span>
                    </button>
                  ))}
                  <button onClick={() => deleteGoal(goal.id)} className="flex items-center gap-1 text-red-400/60 text-xs hover:text-red-400 mt-2">
                    <Trash2 size={12} /> Delete goal
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {adding ? (
        <div className="card-glass rounded-xl p-4 space-y-3">
          <input
            autoFocus
            placeholder="Goal title..."
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30"
          />
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-[#0d0d18] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] text-white"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            type="date"
            value={form.deadline}
            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] text-white/70"
          />
          <div className="space-y-2">
            <p className="text-white/50 text-xs">Milestones</p>
            {form.milestones.map((m, i) => (
              <input
                key={i}
                placeholder={`Milestone ${i + 1}...`}
                value={m}
                onChange={e => setForm(f => {
                  const ms = [...f.milestones]; ms[i] = e.target.value
                  if (i === ms.length - 1 && e.target.value) ms.push('')
                  return { ...f, milestones: ms }
                })}
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842]/50 placeholder-white/20"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addGoal} className="btn-gold text-sm flex-1">Save Goal</button>
            <button onClick={() => setAdding(false)} className="flex-1 text-white/50 text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-[#f5c842] transition-colors py-3 text-sm"
        >
          <PlusCircle size={18} /> Set a new goal
        </button>
      )}
    </div>
  )
}
