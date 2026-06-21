import { useState, useEffect } from 'react'
import { Target, PlusCircle, CheckCircle2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

function loadGoals() {
  try { return JSON.parse(localStorage.getItem('va_goals') || '[]') } catch { return [] }
}

const CATEGORIES = ['Spiritual', 'Physical', 'Financial', 'Relational', 'Creational', 'Professional', 'Generational']

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
