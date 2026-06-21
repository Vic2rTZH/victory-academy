import { useState } from 'react'
import { Shield, Upload, Quote, Headphones, BarChart3, Lock, Eye, EyeOff } from 'lucide-react'
import { SEED_HABITS } from '../lib/seedData'

const ADMIN_PASS = 'victory2024'

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
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('va_admin') === '1')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('analytics')
  const [quoteForm, setQuoteForm] = useState({ text: '', author: '', category: '' })
  const [quotes, setQuotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('va_custom_quotes') || '[]') } catch { return [] }
  })

  const login = () => {
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem('va_admin', '1')
      setAuthed(true)
    } else {
      setError('Incorrect password')
    }
  }

  const addQuote = () => {
    if (!quoteForm.text.trim()) return
    const updated = [...quotes, { ...quoteForm, id: Date.now() }]
    setQuotes(updated)
    localStorage.setItem('va_custom_quotes', JSON.stringify(updated))
    setQuoteForm({ text: '', author: '', category: '' })
  }

  const habitsDone = (() => {
    try {
      const data = JSON.parse(localStorage.getItem('va_habits') || '{}')
      return Object.keys(data).length
    } catch { return 0 }
  })()

  const goalCount = (() => {
    try { return JSON.parse(localStorage.getItem('va_goals') || '[]').length } catch { return 0 }
  })()

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
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Enter admin password"
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
            <Lock size={14} className="inline mr-2" />Enter Dashboard
          </button>
        </div>
        <p className="text-white/20 text-xs">Default password: victory2024</p>
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
          onClick={() => { sessionStorage.removeItem('va_admin'); setAuthed(false) }}
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
            <StatCard label="Custom Quotes" value={quotes.length} icon={Quote} color="text-purple-400" />
            <StatCard label="Streak" value={localStorage.getItem('va_streak') || 0} icon={BarChart3} color="text-orange-400" />
          </div>
          <div className="card-glass rounded-xl p-4 text-center space-y-2">
            <p className="text-white/40 text-xs">Connect Supabase to unlock full analytics</p>
            <p className="text-white/20 text-xs">User sessions Â· Engagement rates Â· Completion trends</p>
          </div>
        </div>
      )}

      {tab === 'quotes' && (
        <div className="space-y-4">
          <div className="card-glass rounded-xl p-4 space-y-3">
            <p className="text-white/60 text-sm font-semibold">Add Quote</p>
            <textarea
              placeholder="Quote text..."
              value={quoteForm.text}
              onChange={e => setQuoteForm(f => ({ ...f, text: e.target.value }))}
              rows={3}
              className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30 resize-none"
            />
            <input
              placeholder="Author..."
              value={quoteForm.author}
              onChange={e => setQuoteForm(f => ({ ...f, author: e.target.value }))}
              className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30"
            />
            <input
              placeholder="Category (e.g. Mindset, Habits)..."
              value={quoteForm.category}
              onChange={e => setQuoteForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5c842] placeholder-white/30"
            />
            <button onClick={addQuote} className="btn-gold w-full text-sm">Save Quote</button>
          </div>
          <div className="space-y-2">
            {quotes.map(q => (
              <div key={q.id} className="card-glass rounded-xl p-3 space-y-1">
                <p className="text-sm text-white/80">"{q.text}"</p>
                <p className="text-white/40 text-xs">{q.author} Â· {q.category}</p>
              </div>
            ))}
            {quotes.length === 0 && <p className="text-white/20 text-xs text-center py-4">No custom quotes yet</p>}
          </div>
        </div>
      )}

      {tab === 'audio' && (
        <div className="space-y-4">
          <div className="card-glass rounded-xl p-6 text-center space-y-3 border-2 border-dashed border-white/20">
            <Upload size={32} className="text-white/30 mx-auto" />
            <p className="text-white/60 text-sm font-semibold">Upload Audio Files</p>
            <p className="text-white/30 text-xs">Connect Supabase Storage to enable audio uploads (MP3, AAC, M4A)</p>
            <button className="btn-gold text-sm opacity-50 cursor-not-allowed" disabled>
              Connect Supabase First
            </button>
          </div>
          <div className="card-glass rounded-xl p-4 space-y-2">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Setup Steps</p>
            {[
              'Create a free Supabase project at supabase.com',
              'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env',
              'Run the SQL schema (see /docs/schema.sql)',
              'Upload audio files and they appear automatically',
            ].map((step, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-[#f5c842] shrink-0 font-bold">{i + 1}.</span>
                <span className="text-white/50">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
