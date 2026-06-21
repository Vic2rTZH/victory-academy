import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

const PLACEHOLDER_TRACKS = [
  { id: 1, title: 'Take Command — Introduction', duration: '5:30', category: 'Mindset', emoji: '🧠' },
  { id: 2, title: 'Building Unbreakable Habits', duration: '8:15', category: 'Habits', emoji: '🔥' },
  { id: 3, title: 'The Power of Daily Systems', duration: '6:45', category: 'Systems', emoji: '⚙️' },
  { id: 4, title: 'Mental Resilience Training', duration: '7:00', category: 'Resilience', emoji: '💪' },
  { id: 5, title: 'Goal Setting with Precision', duration: '9:20', category: 'Goals', emoji: '🎯' },
  { id: 6, title: 'Morning Command Ritual', duration: '4:55', category: 'Routines', emoji: '🌅' },
]

export default function Audio() {
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)

  const select = (track) => {
    if (current?.id === track.id) {
      setPlaying(p => !p)
    } else {
      setCurrent(track)
      setPlaying(true)
    }
  }

  const prev = () => {
    if (!current) return
    const i = PLACEHOLDER_TRACKS.findIndex(t => t.id === current.id)
    setCurrent(PLACEHOLDER_TRACKS[(i - 1 + PLACEHOLDER_TRACKS.length) % PLACEHOLDER_TRACKS.length])
  }

  const next = () => {
    if (!current) return
    const i = PLACEHOLDER_TRACKS.findIndex(t => t.id === current.id)
    setCurrent(PLACEHOLDER_TRACKS[(i + 1) % PLACEHOLDER_TRACKS.length])
  }

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="font-military text-3xl gold-gradient tracking-widest">AUDIO INTEL</h1>
        <p className="text-white/40 text-xs tracking-widest font-body uppercase">Fuel your mindset on the go</p>
      </div>

      {/* Mini Player */}
      {current && (
        <div className="card-glass rounded-2xl p-5 space-y-4 border border-[#f5c842]/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{current.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{current.title}</p>
              <p className="text-white/40 text-xs">{current.category} · {current.duration}</p>
            </div>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 rounded-full" style={{ background: '#f5c842' }} />
          </div>
          <div className="flex items-center justify-center gap-6">
            <button onClick={prev} className="text-white/50 hover:text-white transition-colors"><SkipBack size={22} /></button>
            <button
              onClick={() => setPlaying(p => !p)}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg,#c9972b,#f5c842)' }}
            >
              {playing
                ? <Pause size={20} className="text-[#0d0d18]" />
                : <Play size={20} className="text-[#0d0d18] ml-0.5" />
              }
            </button>
            <button onClick={next} className="text-white/50 hover:text-white transition-colors"><SkipForward size={22} /></button>
          </div>
          <p className="text-center text-white/30 text-xs">
            {playing ? '▶ Playing (connect audio files in Admin)' : '⏸ Paused'}
          </p>
        </div>
      )}

      {/* Track list */}
      <div className="space-y-3">
        {PLACEHOLDER_TRACKS.map(track => {
          const active = current?.id === track.id
          return (
            <button
              key={track.id}
              onClick={() => select(track)}
              className={`w-full card-glass rounded-xl px-4 py-4 flex items-center gap-3 text-left transition-all ${
                active ? 'border-[#f5c842]/40 bg-[#f5c842]/5' : 'hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{track.emoji}</span>
              <div className="flex-1">
                <p className="font-military tracking-wider text-sm">{track.title}</p>
                <p className="text-white/40 text-xs font-body">{track.category} · {track.duration}</p>
              </div>
              {active && playing
                ? <Volume2 size={16} className="text-[#f5c842]" />
                : <Play size={16} className="text-white/20" />
              }
            </button>
          )
        })}
      </div>

      <p className="text-center text-white/20 text-xs pb-2 font-military tracking-widest">
        UPLOAD AUDIO FILES VIA ADMIN DASHBOARD
      </p>
    </div>
  )
}
