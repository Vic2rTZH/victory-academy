import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Target, Headphones } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'HOME' },
  { to: '/habits', icon: CheckSquare, label: 'HABITS' },
  { to: '/goals', icon: Target, label: 'GOALS' },
  { to: '/audio', icon: Headphones, label: 'AUDIO' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#08080f] border-t border-white/8 flex justify-around py-3 px-1 z-50">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 transition-all ${
              isActive ? 'text-[#f5c842]' : 'text-white/25 hover:text-white/50'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="font-military text-[9px] tracking-widest">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
