import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 hidden sm:block">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">KiwiCar</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              New Zealand's AI-powered used car marketplace. Find your perfect car with smart search and AI pricing.
            </p>
          </div>

          {/* Buyers */}
          <div>
            <h3 className="font-semibold mb-3">For Buyers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/search" className="hover:text-foreground">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link to="/plate-check" className="hover:text-foreground">
                  Plate Check
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-foreground">
                  Saved Cars
                </Link>
              </li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-semibold mb-3">For Sellers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/sell" className="hover:text-foreground">
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link to="/my-listings" className="hover:text-foreground">
                  My Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-foreground">
                  Help Centre
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KiwiCar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
