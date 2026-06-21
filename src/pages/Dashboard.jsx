import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodayQuote, SEED_QUOTES } from '../lib/seedData'
import { Flame, ChevronRight, RefreshCw, Loader2, CheckSquare, Target, Headphones } from 'lucide-react'
import { supabase } from '../lib/supabase'

async function fetchDailyQuote() {
  try {
    const res = await fetch('/victory-academy/daily-quote.json?t=' + Date.now())
    if (!res.ok) return null
    const data = await res.json()
    // Only use if it's today's quote
    const today = new Date().toISOString().slice(0, 10)
    if (data.date === today) return data
    return null
  } catch {
    return null
  }
}

export default function Dashboard() {
  const [dailyQuote, setDailyQuote] = useState(null)
  const [cycleIdx, setCycleIdx] = useState(0)
  const [isCycling, setIsCycling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newEpisode, setNewEpisode] = useState(false)
  const streak = Number(localStorage.getItem('va_streak') || 0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDailyQuote().then(q => {
      setDailyQuote(q)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.from('episodes').select('id').order('id', { ascending: false }).limit(1)
      .then(({ data }) => {
        if (!data?.length) return
        const latestId = data[0].id
        const seenId = localStorage.getItem('va_last_seen_episode')
        if (seenId !== String(latestId)) setNewEpisode(true)
      })
  }, [])

  const goToPodcast = () => {
    supabase?.from('episodes').select('id').order('id', { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data?.length) localStorage.setItem('va_last_seen_episode', String(data[0].id))
      })
    setNewEpisode(false)
    navigate('/audio')
  }

  // The displayed quote: daily AI quote first, then seed bank when cycling
  const displayQuote = isCycling
    ? SEED_QUOTES[cycleIdx % SEED_QUOTES.length]
    : (dailyQuote || getTodayQuote())

  const cycleQuote = () => {
    if (!isCycling) {
      setIsCycling(true)
      setCycleIdx(0)
    } else {
      setCycleIdx(i => i + 1)
    }
  }

  const backToDaily = () => {
    setIsCycling(false)
  }

  return (
    <div className="space-y-5">
      {/* Header with logo */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <img
            src="/victory-academy/va-logo.jpg"
            alt="Victory Academy"
            className="w-12 h-12 rounded-full object-cover"
            style={{ mixBlendMode: 'lighten' }}
          />
          <div>
            <h1 className="font-military text-2xl gold-gradient leading-none tracking-widest">
              VICTORY ACADEMY
            </h1>
            <p className="text-white/40 text-xs tracking-widest uppercase font-body">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 card-glass rounded-lg px-3 py-2">
          <Flame size={16} className="gold-text" />
          <span className="font-military text-lg gold-text">{streak}</span>
        </div>
      </div>

      <div className="divider-military" />

      {/* Daily Command Quote */}
      <div className="card-command rounded-xl p-5 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 opacity-5"
          style={{ background: 'radial-gradient(circle, #f5c842, transparent)' }} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-military text-sm tracking-widest gold-text">
              ◆ {isCycling ? 'ARCHIVES' : 'DAILY COMMAND'}
            </span>
            {!isCycling && dailyQuote && (
              <span className="text-[9px] bg-[#f5c842]/15 gold-text px-1.5 py-0.5 rounded font-military tracking-wider">
                AI
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCycling && (
              <button
                onClick={backToDaily}
                className="text-white/30 hover:gold-text transition-colors text-xs font-military tracking-wider"
              >
                ← TODAY
              </button>
            )}
            <button
              onClick={cycleQuote}
              className="text-white/30 hover:gold-text transition-colors"
              title={isCycling ? 'Next quote' : 'Browse archive'}
            >
              {loading
                ? <Loader2 size={13} className="animate-spin" />
                : <RefreshCw size={13} />
              }
            </button>
          </div>
        </div>

        <blockquote className="font-body text-base font-medium leading-relaxed text-white/90">
          "{displayQuote.text}"
        </blockquote>

        <div className="flex items-center justify-between">
          <p className="text-white/40 text-xs font-body">— {displayQuote.author}</p>
          <span className="bg-[#f5c842]/10 gold-text text-xs px-2 py-0.5 rounded font-military tracking-wider">
            {displayQuote.category?.toUpperCase()}
          </span>
        </div>

        {isCycling && (
          <p className="text-white/20 text-[10px] font-military tracking-widest text-center">
            {cycleIdx + 1} OF {SEED_QUOTES.length} — NEW AI QUOTE DROPS DAILY
          </p>
        )}
      </div>

      {/* SITREP */}
      <div>
        <p className="font-military text-xs tracking-widest text-white/30 mb-3">◆ SITREP — MISSION STATUS</p>
        <div className="space-y-2">
          {[
            { label: 'TRACK DAILY HABITS', sub: 'Build your battle rhythm', path: '/habits', icon: CheckSquare },
            { label: 'REVIEW OBJECTIVES', sub: 'Stay locked onto your targets', path: '/goals', icon: Target },
            { label: 'TC-PODCAST', sub: 'Take Command Podcast', path: '/audio', icon: Headphones },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => item.path === '/audio' ? goToPodcast() : navigate(item.path)}
              className="w-full card-glass rounded-lg px-4 py-3.5 flex items-center justify-between hover:bg-white/8 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <item.icon size={16} strokeWidth={1.5} className="text-white/50 group-hover:gold-text transition-colors" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-military tracking-wider text-sm text-white group-hover:gold-text transition-colors">
                      {item.label}
                    </p>
                    {item.path === '/audio' && newEpisode && (
                      <span className="flex items-center gap-1 bg-[#f5c842] text-[#0d0d18] text-[9px] font-military tracking-wider px-1.5 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs font-body">
                    {item.path === '/audio' && newEpisode ? 'New episode available' : item.sub}
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:gold-text transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-2">
        <p className="font-military text-xs tracking-[0.2em] text-white/20">
          TAKE COMMAND — EVERY SINGLE DAY
        </p>
      </div>
    </div>
  )
}
