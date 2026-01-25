import { Outlet } from 'react-router-dom'
import { Navbar, MobileNav } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
