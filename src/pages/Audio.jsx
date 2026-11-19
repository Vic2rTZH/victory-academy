import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Loader2, MonitorPlay, Mic, Headphones, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Episodes come from TC HQ (YouTube video and/or audio) or the admin Audio tab.
function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
const thumbOf = (ep) => ep.thumbnail_url || (ep.youtube_id ? `https://i.ytimg.com/vi/${ep.youtube_id}/hqdefault.jpg` : null)

function AudioPlayer({ ep, onPrev, onNext }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  useEffect(() => {
    const a = ref.current
    if (!a) return
    a.src = ep.audio_url
    a.load()
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    const onTime = () => setT(a.currentTime)
    const onMeta = () => setDur(a.duration)
    const onEnd = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime); a.addEventListener('loadedmetadata', onMeta); a.addEventListener('ended', onEnd)
    return () => { a.pause(); a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onMeta); a.removeEventListener('ended', onEnd) }
  }, [ep.audio_url])
  const toggle = () => { const a = ref.current; if (!a) return; if (playing) a.pause(); else a.play(); setPlaying(!playing) }
  const jump = (s) => { const a = ref.current; if (a) a.currentTime = Math.max(0, Math.min(dur, a.currentTime + s)) }
  const seek = (e) => { const a = ref.current; if (!a || !dur) return; const r = e.currentTarget.getBoundingClientRect(); a.currentTime = ((e.clientX - r.left) / r.width) * dur }
  return (
    <div className="space-y-3">
      <audio ref={ref} preload="metadata" />
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={seek}>
        <div className="h-full rounded-full" style={{ width: `${dur ? (t / dur) * 100 : 0}%`, background: 'linear-gradient(90deg,#c9972b,#f5c842)' }} />
      </div>
      <div className="flex justify-between text-[10px] text-white/30 font-body -mt-1"><span>{formatTime(t)}</span><span>{formatTime(dur)}</span></div>
      <div className="flex items-center justify-center gap-5">
        <button onClick={onPrev} className="text-white/40 hover:text-white" aria-label="Previous"><SkipBack size={20} /></button>
        <button onClick={() => jump(-15)} className="text-white/40 hover:text-white text-xs font-military">-15</button>
        <button onClick={toggle} className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95" style={{ background: 'linear-gradient(135deg,#c9972b,#f5c842)' }} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={22} className="text-[#0d0d18]" /> : <Play size={22} className="text-[#0d0d18] ml-0.5" />}
        </button>
        <button onClick={() => jump(15)} className="text-white/40 hover:text-white text-xs font-military">+15</button>
        <button onClick={onNext} className="text-white/40 hover:text-white" aria-label="Next"><SkipForward size={20} /></button>
      </div>
    </div>
  )
}

export default function Episodes() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(!!supabase)
  const [current, setCurrent] = useState(null)
  const [mode, setMode] = useState('watch')

  useEffect(() => {
    if (!supabase) return
    supabase.from('episodes').select('*').eq('published', true)
      .order('episode_number', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
      .then(({ data }) => setEpisodes(data ?? []), () => setEpisodes([]))
      .finally(() => setLoading(false))
  }, [])

  const open = (ep) => {
    setCurrent(ep)
    setMode(ep.youtube_id ? 'watch' : 'listen')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const step = (dir) => {
    const list = episodes.filter(e => e.audio_url)
    const i = list.findIndex(e => e.id === current?.id)
    if (i >= 0 && list.length) open(list[(i + dir + list.length) % list.length])
  }

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <div className="flex items-center gap-2">
          <MonitorPlay size={18} className="gold-text" />
          <h1 className="font-military text-3xl gold-gradient tracking-widest">EPISODES</h1>
        </div>
        <p className="text-white/40 text-xs tracking-widest font-body uppercase">Take Command — watch or listen</p>
      </div>

      {current && (
        <div className="card-command rounded-xl overflow-hidden">
          {mode === 'watch' && current.youtube_id ? (
            <div className="relative w-full" style={{ aspectRatio: '16 / 9', background: '#000' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${current.youtube_id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={current.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          ) : null}
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-military tracking-wider text-sm">{current.title}</p>
                <p className="text-white/40 text-xs font-body">
                  {current.episode_number ? `EP ${current.episode_number} · ` : ''}{current.category}{current.duration ? ` · ${current.duration}` : ''}
                </p>
              </div>
              <button onClick={() => setCurrent(null)} className="text-white/30 hover:text-white" aria-label="Close"><X size={16} /></button>
            </div>
            {current.youtube_id && current.audio_url && (
              <div className="flex gap-2">
                {[['watch', 'Watch', MonitorPlay], ['listen', 'Listen', Headphones]].map(([k, l, I]) => (
                  <button key={k} onClick={() => setMode(k)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-military tracking-wider ${mode === k ? 'bg-[#f5c842] text-[#0d0d18]' : 'bg-white/5 text-white/50'}`}>
                    <I size={13} /> {l}
                  </button>
                ))}
              </div>
            )}
            {mode === 'listen' && current.audio_url && <AudioPlayer ep={current} onPrev={() => step(-1)} onNext={() => step(1)} />}
            {current.description && <p className="text-white/50 text-sm font-body leading-relaxed">{current.description}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="gold-text animate-spin" /></div>
      ) : episodes.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-12 font-body">New episodes are on their way.</p>
      ) : (
        <div className="space-y-2">
          <p className="font-military text-xs tracking-widest text-white/30">◆ ALL EPISODES</p>
          {episodes.map(ep => {
            const active = current?.id === ep.id
            const thumb = thumbOf(ep)
            return (
              <button key={ep.id} onClick={() => open(ep)}
                className={`w-full card-glass rounded-xl p-3 flex items-center gap-3 text-left transition-all ${active ? 'card-command' : 'hover:bg-white/8'}`}>
                <div className="relative w-24 shrink-0 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}>
                  {thumb ? <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Mic size={16} strokeWidth={1.5} className="text-white/30" />}
                  {ep.duration && <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-[9px] text-white px-1 rounded font-body">{ep.duration}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-military tracking-wider text-[11px] text-white/50 mb-0.5">
                    {ep.episode_number ? `EP ${ep.episode_number}` : 'EPISODE'}{ep.category ? ` · ${ep.category.toUpperCase()}` : ''}
                  </p>
                  <p className="font-military tracking-wide text-sm leading-tight line-clamp-2">{ep.title}</p>
                  <div className="flex gap-2 mt-1 text-white/30">
                    {ep.youtube_id && <MonitorPlay size={12} aria-label="Video" />}
                    {ep.audio_url && <Headphones size={12} aria-label="Audio" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
