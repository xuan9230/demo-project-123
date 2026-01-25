import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, User, Plus, Home, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6">
          <Car className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold hidden sm:inline">KiwiCar</span>
        </Link>

        {/* Search bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mr-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search make, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button asChild variant="default" className="hidden sm:flex">
            <Link to="/sell">
              <Plus className="h-4 w-4 mr-2" />
              Sell Your Car
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="hidden sm:flex">
            <Link to="/favorites">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.nickname} />
                    <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.nickname}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/my-listings">My Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites">Favorites</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account">Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

// Mobile bottom navigation
export function MobileNav() {
  const location = useLocation()

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/sell', icon: Plus, label: 'Sell' },
    { href: '/favorites', icon: Heart, label: 'Favorites' },
    { href: '/account', icon: User, label: 'Account' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', item.href === '/sell' && 'h-6 w-6')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
