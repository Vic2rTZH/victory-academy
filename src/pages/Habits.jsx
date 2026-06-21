import { useState, useEffect } from 'react'
import { SEED_HABITS } from '../lib/seedData'
import { CheckCircle2, Circle, PlusCircle, Flame } from 'lucide-react'

const TODAY = new Date().toDateString()

function loadState() {
  try {
    const raw = localStorage.getItem('va_habits')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export default function Habits() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('va_habit_list')
    return saved ? JSON.parse(saved) : SEED_HABITS
  })
  const [checked, setChecked] = useState(loadState)
  const [newHabit, setNewHabit] = useState('')
  const [adding, setAdding] = useState(false)

  const todayKey = TODAY
  const todayChecked = checked[todayKey] || {}
  const completedCount = Object.values(todayChecked).filter(Boolean).length

  useEffect(() => {
    localStorage.setItem('va_habits', JSON.stringify(checked))
    // update streak
    const keys = Object.keys(checked).filter(k => {
      const vals = checked[k]
      return Object.values(vals).some(Boolean)
    }).sort()
    localStorage.setItem('va_streak', keys.length)
  }, [checked])

  useEffect(() => {
    localStorage.setItem('va_habit_list', JSON.stringify(habits))
  }, [habits])

  const toggle = (id) => {
    setChecked(prev => ({
      ...prev,
      [todayKey]: { ...prev[todayKey], [id]: !prev[todayKey]?.[id] }
    }))
  }

  const addHabit = () => {
    if (!newHabit.trim()) return
    setHabits(prev => [...prev, { name: newHabit.trim(), icon: 'â­', category: 'Custom' }])
    setNewHabit('')
    setAdding(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-military text-3xl gold-gradient tracking-widest">DAILY HABITS</h1>
          <p className="text-white/40 text-xs tracking-widest font-body uppercase">{completedCount}/{habits.length} objectives completed</p>
        </div>
        <div className="card-glass rounded-lg px-3 py-2 flex items-center gap-1">
          <Flame size={16} className="gold-text" />
          <span className="font-military text-xl gold-text">{completedCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${habits.length ? (completedCount / habits.length) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #f5c842, #f5c842)',
          }}
        />
      </div>

      {/* Habit list */}
      <div className="space-y-3">
        {habits.map((habit, i) => {
          const done = !!todayChecked[i]
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-full card-glass rounded-xl px-4 py-4 flex items-center gap-4 transition-all ${
                done ? 'border-[#f5c842]/40 bg-[#f5c842]/5' : 'hover:bg-white/10'
              }`}
            >
              {done
                ? <CheckCircle2 size={22} className="text-[#f5c842] shrink-0" />
                : <Circle size={22} className="text-white/30 shrink-0" />
              }
              <span className="text-2xl">{habit.icon}</span>
              <div className="text-left flex-1">
                <p className={`font-semibold text-sm ${done ? 'line-through text-white/40' : ''}`}>{habit.name}</p>
                <p className="text-white/30 text-xs">{habit.category}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Add habit */}
      {adding ? (
        <div className="card-glass rounded-xl p-4 space-y-3">
          <input
            autoFocus
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
            placeholder="New habit name..."
            className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30"
          />
          <div className="flex gap-2">
            <button onClick={addHabit} className="btn-gold text-sm flex-1">Add</button>
            <button onClick={() => setAdding(false)} className="flex-1 text-white/50 text-sm hover:text-white">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-[#f5c842] transition-colors py-3 text-sm"
        >
          <PlusCircle size={18} />
          Add custom habit
        </button>
      )}
    </div>
  )
}
