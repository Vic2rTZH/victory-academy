import { useState, useRef, useEffect } from 'react'
import { Shield, Upload, Quote, Headphones, BarChart3, Lock, Eye, EyeOff, Loader2, Trash2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Admin sign-in uses Victor's Supabase account (same as cc.bantuwa.org).
// Writes are enforced by database rules (private.is_app_admin), not by this page.
const RESET_URL = 'https://cc.bantuwa.org/forgot'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card-glass rounded-xl p-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs">{label}</span>
        <Icon size={14} className={color} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(!!supabase)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('analytics')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setAuthed(!!data.session); setChecking(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session))
    return () => sub.subscription.unsubscribe()
  }, [])

  const login = async () => {
    if (!supabase) return setError('Supabase not connected')
    setError('')
    const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass })
    if (e) setError('Sign-in failed — check your email and password')
    setPass('')
  }

  const logout = async () => { await supabase?.auth.signOut(); setAuthed(false) }

  const habitsDone = (() => {
    try {
      const data = JSON.parse(localStorage.getItem('va_habits') || '{}')
      return Object.keys(data).length
    } catch { return 0 }
  })()

  const goalCount = (() => {
    try { return JSON.parse(localStorage.getItem('va_goals') || '[]').length } catch { return 0 }
  })()

  if (checking) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-white/30" /></div>

  if (!authed) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg,#c9972b,#f5c842)' }}>
            <Shield size={28} className="text-[#0d0d18]" />
          </div>
          <h1 className="font-military text-2xl tracking-widest gold-gradient">COMMAND CENTER</h1>
          <p className="text-white/40 text-xs tracking-widest uppercase font-body">Admin Dashboard</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <input
            type="email"
            autoComplete="username"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#f5c842] placeholder-white/30"
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#f5c842] placeholder-white/30"
            />
            <button
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button onClick={login} className="btn-gold w-full">
            <Lock size={14} className="inline mr-2" />Sign in
          </button>
          <p className="text-center text-xs text-white/30">Same account as the VS Command Center. <a href={RESET_URL} className="underline hover:text-white/60">Forgot password?</a></p>
        </div>
      </div>
    )
  }

  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'quotes', label: 'Quotes', icon: Quote },
    { id: 'audio', label: 'Audio', icon: Headphones },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gold-gradient">Admin</h1>
          <p className="text-white/40 text-sm">Victory Academy dashboard</p>
        </div>
        <button
          onClick={logout}
          className="text-white/30 hover:text-white/60 text-xs"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 card-glass rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-[#f5c842] text-[#0d0d18]' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Habit Days Logged" value={habitsDone} icon={BarChart3} color="text-[#f5c842]" />
            <StatCard label="Active Goals" value={goalCount} icon={BarChart3} color="text-green-400" />
            <StatCard label="Streak" value={localStorage.getItem('va_streak') || 0} icon={BarChart3} color="text-orange-400" />
          </div>
        </div>
      )}

      {tab === 'quotes' && <QuotesTab />}

      {tab === 'audio' && (
        <AudioUploadTab />
      )}
    </div>
  )
}

function QuotesTab() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [tick, setTick] = useState(0)
  const load = () => setTick(t => t + 1)
  useEffect(() => {
    if (!supabase) return
    supabase.from('quotes').select('id, text, author, source, kind, category, active').order('created_at', { ascending: true })
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows(data) })
  }, [tick])
  const act = async (q, action) => {
    const { error } = action === 'delete'
      ? await supabase.from('quotes').delete().eq('id', q.id)
      : await supabase.from('quotes').update({ active: !q.active }).eq('id', q.id)
    if (error) setErr(error.message); else load()
  }
  if (!supabase) return <p className="text-white/40 text-sm">Supabase not connected</p>
  return (
    <div className="space-y-3">
      <div className="card-glass rounded-xl p-4 text-sm text-white/60">
        Daily Command shows one card a day from this list. Add new cards from <span className="gold-text">TC HQ → Cards → Send to Victory Academy</span>.
      </div>
      {err && <p className="text-red-400 text-xs">{err}</p>}
      {rows?.map(q => (
        <div key={q.id} className="card-glass rounded-xl p-3 space-y-1" style={{ opacity: q.active ? 1 : 0.5 }}>
          <p className="text-sm text-white/80">{q.kind === 'quote' ? `"${q.text}"` : q.text}</p>
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs">{q.kind === 'quote' ? 'Quote' : 'Principle'} · {q.author}{q.category ? ` · ${q.category}` : ''}</p>
            <div className="flex gap-3">
              <button onClick={() => act(q, 'toggle')} className="text-white/40 hover:text-white text-xs">{q.active ? 'Hide' : 'Show'}</button>
              <button onClick={() => confirm('Delete this card?') && act(q, 'delete')} className="text-red-400/70 hover:text-red-400"><Trash2 size={13} /></button>
            </div>
          </div>
        </div>
      ))}
      {rows && rows.length === 0 && <p className="text-white/20 text-xs text-center py-4">No cards yet</p>}
    </div>
  )
}

function AudioUploadTab() {
  const fileRef = useRef()
  const [form, setForm] = useState({ title: '', description: '', episode_number: '', category: 'Mindset' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [loaded, setLoaded] = useState(false)

  const CATEGORIES = ['Mindset', 'Habits', 'Resilience', 'Systems', 'Goals', 'Discipline', 'Spiritual', 'Physical', 'Command']

  const loadEpisodes = async () => {
    if (!supabase) return
    const { data } = await supabase.from('episodes').select('*').order('episode_number')
    if (data) setEpisodes(data)
    setLoaded(true)
  }

  useState(() => { loadEpisodes() }, [])

  const upload = async () => {
    if (!supabase) return setStatus({ error: 'Supabase not connected' })
    if (!file || !form.title.trim()) return setStatus({ error: 'Title and audio file required' })
    setUploading(true)
    setStatus(null)

    const ext = file.name.split('.').pop()
    const fileName = `ep${form.episode_number || Date.now()}-${Date.now()}.${ext}`

    const { error: storageErr } = await supabase.storage
      .from('podcast-audio')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (storageErr) {
      setUploading(false)
      return setStatus({ error: storageErr.message })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('podcast-audio')
      .getPublicUrl(fileName)

    const { error: dbErr } = await supabase.from('episodes').insert({
      title: form.title,
      description: form.description,
      episode_number: form.episode_number ? parseInt(form.episode_number) : null,
      category: form.category,
      audio_url: publicUrl,
      published: true,
    })

    setUploading(false)
    if (dbErr) return setStatus({ error: dbErr.message })

    setStatus({ success: `"${form.title}" uploaded successfully!` })
    setForm({ title: '', description: '', episode_number: '', category: 'Mindset' })
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
    loadEpisodes()
  }

  const deleteEpisode = async (ep) => {
    if (!supabase) return
    const fileName = ep.audio_url.split('/').pop()
    const { error: dErr } = await supabase.from('episodes').delete().eq('id', ep.id)
    if (dErr) { setStatus({ error: dErr.message }); return }
    await supabase.storage.from('podcast-audio').remove([fileName])
    loadEpisodes()
  }

  const moveEpisode = async (idx, dir) => {
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= episodes.length) return
    const a = episodes[idx]
    const b = episodes[swapIdx]
    // Assign position-based numbers if missing, then swap
    const numA = idx + 1
    const numB = swapIdx + 1
    const [r1, r2] = await Promise.all([
      supabase.from('episodes').update({ episode_number: numB }).eq('id', a.id),
      supabase.from('episodes').update({ episode_number: numA }).eq('id', b.id),
    ])
    if (r1.error) { setStatus({ error: r1.error.message }); return }
    if (r2.error) { setStatus({ error: r2.error.message }); return }
    loadEpisodes()
  }

  if (!supabase) {
    return (
      <div className="card-glass rounded-xl p-6 text-center space-y-2">
        <Upload size={28} className="text-white/20 mx-auto" />
        <p className="text-white/40 text-sm">Supabase not connected</p>
        <p className="text-white/20 text-xs">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload form */}
      <div className="card-glass rounded-xl p-4 space-y-3">
        <p className="font-military tracking-wider text-sm gold-text">◆ UPLOAD EPISODE</p>
        <input
          placeholder="Episode title..."
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30 font-body"
        />
        <textarea
          placeholder="Short description..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={2}
          className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30 font-body resize-none"
        />
        <div className="flex gap-2">
          <input
            placeholder="EP #"
            type="number"
            value={form.episode_number}
            onChange={e => setForm(f => ({ ...f, episode_number: e.target.value }))}
            className="w-20 bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30 font-body"
          />
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="flex-1 bg-[#0d0d18] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] text-white font-body"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* File picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-[#f5c842]/40 transition-colors"
        >
          <Upload size={20} className="text-white/30 mx-auto mb-1" />
          <p className="text-white/40 text-xs font-body">
            {file ? file.name : 'Click to select MP3 / M4A / AAC'}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={e => setFile(e.target.files[0])}
        />

        {status?.error && <p className="text-red-400 text-xs">{status.error}</p>}
        {status?.success && (
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <CheckCircle2 size={14} /> {status.success}
          </div>
        )}

        <button
          onClick={upload}
          disabled={uploading}
          className="btn-gold w-full flex items-center justify-center gap-2"
        >
          {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : 'Upload Episode'}
        </button>
      </div>

      {/* Episode list */}
      {loaded && episodes.length > 0 && (
        <div className="space-y-2">
          <p className="font-military text-xs tracking-widest text-white/30">◆ PUBLISHED EPISODES</p>
          {episodes.map((ep, idx) => (
            <div key={ep.id} className="card-glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveEpisode(idx, -1)}
                  disabled={idx === 0}
                  className="text-white/20 hover:text-[#f5c842] disabled:opacity-0 transition-colors"
                >
                  <ChevronUp size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => moveEpisode(idx, 1)}
                  disabled={idx === episodes.length - 1}
                  className="text-white/20 hover:text-[#f5c842] disabled:opacity-0 transition-colors"
                >
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-military tracking-wide text-sm truncate">{ep.title}</p>
                <p className="text-white/30 text-xs font-body">{ep.episode_number ? `EP ${ep.episode_number} · ` : ''}{ep.category}</p>
              </div>
              <button
                onClick={() => deleteEpisode(ep)}
                className="text-red-400/40 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
