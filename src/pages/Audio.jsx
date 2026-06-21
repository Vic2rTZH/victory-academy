import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, Radio, Mic } from 'lucide-react'
import { supabase } from '../lib/supabase'

const FALLBACK_TRACKS = [
  { id: 1, title: 'Take Command — Introduction', description: 'An introduction to the Take Command framework and the VICTORY Protocol.', episode_number: 1, category: 'Mindset', audio_url: null, duration: '5:30', emoji: '🧠' },
  { id: 2, title: 'Building Unbreakable Habits', description: 'How to build systems that outlast motivation.', episode_number: 2, category: 'Habits', audio_url: null, duration: '8:15', emoji: '🔥' },
  { id: 3, title: 'The Power of Daily Systems', description: 'Why your routine is your most powerful weapon.', episode_number: 3, category: 'Systems', audio_url: null, duration: '6:45', emoji: '⚙️' },
  { id: 4, title: 'Mental Resilience Training', description: 'Tactics for building an unbreakable mind.', episode_number: 4, category: 'Resilience', audio_url: null, duration: '7:00', emoji: '💪' },
  { id: 5, title: 'Goal Setting with Precision', description: 'The military approach to setting and achieving objectives.', episode_number: 5, category: 'Goals', audio_url: null, duration: '9:20', emoji: '🎯' },
  { id: 6, title: 'Morning Command Ritual', description: 'Design a morning routine that sets the tone for victory.', episode_number: 6, category: 'Routines', audio_url: null, duration: '4:55', emoji: '🌅' },
]

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Audio() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    loadEpisodes()
  }, [])

  const loadEpisodes = async () => {
    if (!supabase) {
      setEpisodes(FALLBACK_TRACKS)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('published', true)
      .order('episode_number', { ascending: true })

    if (error || !data?.length) {
      setEpisodes(FALLBACK_TRACKS)
    } else {
      setEpisodes(data)
    }
    setLoading(false)
  }

  const select = (ep) => {
    if (current?.id === ep.id) {
      togglePlay()
      return
    }
    setCurrent(ep)
    setPlaying(false)
    setProgress(0)
    setCurrentTime(0)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(p => !p)
  }

  const skip = (dir) => {
    const idx = episodes.findIndex(e => e.id === current?.id)
    if (idx === -1) return
    const next = episodes[(idx + dir + episodes.length) % episodes.length]
    setCurrent(next)
    setPlaying(false)
    setProgress(0)
  }

  const seek = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }

  const skipSeconds = (secs) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + secs))
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current?.audio_url) return
    audio.src = current.audio_url
    audio.load()
    if (playing) audio.play()

    const onTime = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    }
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => { setPlaying(false); setProgress(0) }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [current])

  const hasAudio = !!current?.audio_url

  return (
    <div className="space-y-5">
      <audio ref={audioRef} preload="metadata" />

      <div className="pt-2">
        <div className="flex items-center gap-2">
          <Radio size={18} className="gold-text" />
          <h1 className="font-military text-3xl gold-gradient tracking-widest">TC-PODCAST</h1>
        </div>
        <p className="text-white/40 text-xs tracking-widest font-body uppercase">Take Command — Motivational Intel</p>
      </div>

      {/* Player */}
      {current && (
        <div className="card-command rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f5c842]/10 flex items-center justify-center shrink-0">
              <Mic size={18} strokeWidth={1.5} className="gold-text" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-military tracking-wider text-sm truncate">{current.title}</p>
              <p className="text-white/40 text-xs font-body">
                {current.episode_number ? `EP ${current.episode_number} · ` : ''}{current.category}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
            onClick={seek}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg,#c9972b,#f5c842)' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30 font-body -mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5">
            <button onClick={() => skip(-1)} className="text-white/40 hover:text-white transition-colors">
              <SkipBack size={20} />
            </button>
            <button onClick={() => skipSeconds(-15)} className="text-white/40 hover:text-white transition-colors text-xs font-military">
              -15
            </button>
            <button
              onClick={hasAudio ? togglePlay : undefined}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${!hasAudio ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(135deg,#c9972b,#f5c842)' }}
            >
              {playing
                ? <Pause size={22} className="text-[#0d0d18]" />
                : <Play size={22} className="text-[#0d0d18] ml-0.5" />
              }
            </button>
            <button onClick={() => skipSeconds(15)} className="text-white/40 hover:text-white transition-colors text-xs font-military">
              +15
            </button>
            <button onClick={() => skip(1)} className="text-white/40 hover:text-white transition-colors">
              <SkipForward size={20} />
            </button>
          </div>

          {!hasAudio && (
            <p className="text-center text-white/20 text-[10px] font-military tracking-widest">
              UPLOAD AUDIO VIA ADMIN → AUDIO TAB
            </p>
          )}
        </div>
      )}

      {/* Episode list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="gold-text animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-military text-xs tracking-widest text-white/30">◆ EPISODES</p>
          {episodes.map(ep => {
            const active = current?.id === ep.id
            return (
              <button
                key={ep.id}
                onClick={() => select(ep)}
                className={`w-full card-glass rounded-xl px-4 py-4 flex items-center gap-3 text-left transition-all ${
                  active ? 'card-command' : 'hover:bg-white/8'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mic size={14} strokeWidth={1.5} className="text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-military tracking-wider text-xs text-white/50 mb-0.5">
                    {ep.episode_number ? `EP ${ep.episode_number}` : 'EPISODE'}
                  </p>
                  <p className="font-military tracking-wide text-sm truncate">{ep.title}</p>
                  {ep.description && (
                    <p className="text-white/30 text-xs font-body truncate mt-0.5">{ep.description}</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {active && playing
                    ? <Volume2 size={14} className="gold-text" />
                    : ep.audio_url
                      ? <Play size={14} className="text-white/20" />
                      : <span className="text-[9px] text-white/20 font-military">SOON</span>
                  }
                  {ep.duration && <span className="text-white/20 text-[10px] font-body">{ep.duration}</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
