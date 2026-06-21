import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-svh max-w-md mx-auto relative">
      <main className="flex-1 pb-24 px-4 pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
