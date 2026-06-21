import { useState, useEffect } from 'react'
import { SEED_HABITS } from '../lib/seedData'
import { CheckCircle2, Circle, PlusCircle, Flame, Sun, Dumbbell, BookOpen, Moon, Heart, Droplets, BellOff, Salad, Star } from 'lucide-react'

const TODAY = new Date().toDateString()

const HABIT_ICONS = {
  'Morning Mission Brief': Sun,
  'Physical Training': Dumbbell,
  'Read 20 Minutes': BookOpen,
  'Evening After-Action Review': Moon,
  'Gratitude & Reflection': Heart,
  'Cold Shower / Discipline Drill': Droplets,
  'No Phone First Hour': BellOff,
  'Hydration & Nutrition Check': Salad,
}

function HabitIcon({ name, size = 18, className = '' }) {
  const Icon = HABIT_ICONS[name] || Star
  return <Icon size={size} strokeWidth={1.5} className={className} />
}

function loadState() {
  try {
    const raw = localStorage.getItem('va_habits')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function calcStreak(checked, totalHabits) {
  if (!totalHabits) return 0
  const threshold = Math.ceil(totalHabits / 2) // majority: >50%

  // Collect all days that met the threshold, sorted descending
  const qualifyingDays = Object.keys(checked)
    .filter(day => {
      const done = Object.values(checked[day] || {}).filter(Boolean).length
      return done >= threshold
    })
    .sort((a, b) => new Date(b) - new Date(a))

  if (!qualifyingDays.length) return 0

  // Walk back from today counting consecutive days
  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (const day of qualifyingDays) {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((cursor - d) / 86400000)
    if (diff === 0 || diff === 1) {
      streak++
      cursor = d
    } else {
      break
    }
  }
  return streak
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
  const streak = calcStreak(checked, habits.length)
  const threshold = Math.ceil(habits.length / 2)
  const todayQualifies = completedCount >= threshold

  useEffect(() => {
    localStorage.setItem('va_habits', JSON.stringify(checked))
    localStorage.setItem('va_streak', calcStreak(checked, habits.length))
  }, [checked, habits.length])

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
    setHabits(prev => [...prev, { name: newHabit.trim(), category: 'Custom' }])
    setNewHabit('')
    setAdding(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-military text-3xl gold-gradient tracking-widest">DAILY HABITS</h1>
          <p className="text-white/40 text-xs tracking-widest font-body uppercase">
            {completedCount}/{habits.length} completed
            {todayQualifies
              ? <span className="text-[#f5c842]/60"> · streak day</span>
              : <span className="text-white/20"> · need {threshold - completedCount} more</span>
            }
          </p>
        </div>
        <div className={`card-glass rounded-lg px-3 py-2 flex items-center gap-1.5 ${todayQualifies ? 'border border-[#f5c842]/30' : ''}`}>
          <Flame size={16} strokeWidth={1.5} className={todayQualifies ? 'gold-text' : 'text-white/20'} />
          <div className="text-right">
            <span className="font-military text-xl gold-text">{streak}</span>
            <p className="text-white/30 text-[9px] font-military tracking-widest -mt-1">DAY STREAK</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${habits.length ? (completedCount / habits.length) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #c9972b, #f5c842)',
          }}
        />
      </div>

      {/* Habit list */}
      <div className="space-y-2">
        {habits.map((habit, i) => {
          const done = !!todayChecked[i]
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-full card-glass rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all ${
                done ? 'border-[#f5c842]/30 bg-[#f5c842]/4' : 'hover:bg-white/6'
              }`}
            >
              {done
                ? <CheckCircle2 size={18} strokeWidth={1.5} className="gold-text shrink-0" />
                : <Circle size={18} strokeWidth={1.5} className="text-white/20 shrink-0" />
              }
              <HabitIcon
                name={habit.name}
                className={done ? 'gold-text shrink-0' : 'text-white/40 shrink-0'}
              />
              <div className="text-left flex-1">
                <p className={`font-body font-semibold text-sm ${done ? 'line-through text-white/30' : ''}`}>{habit.name}</p>
                <p className="text-white/25 text-xs font-body tracking-wider">{habit.category}</p>
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
            className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30 font-body"
          />
          <div className="flex gap-2">
            <button onClick={addHabit} className="btn-gold text-sm flex-1">Add</button>
            <button onClick={() => setAdding(false)} className="flex-1 text-white/50 text-sm hover:text-white">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-[#f5c842] transition-colors py-3 text-sm"
        >
          <PlusCircle size={16} strokeWidth={1.5} />
          <span className="font-military tracking-wider text-xs">ADD CUSTOM HABIT</span>
        </button>
      )}
    </div>
  )
}
