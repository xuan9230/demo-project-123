import { Link, useNavigate } from 'react-router-dom'
import { Search, Car, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListingCard, ListingCardSkeleton } from '@/components/common/ListingCard'
import { useState } from 'react'
import type { Listing } from '@/types'
import { trpc } from '@/lib/trpc'

const mapLuxuryListing = (listing: {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  region: string
  coverImage: string | null
  createdAt: string
  status: 'active' | 'sold' | 'removed'
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric'
  transmission: 'automatic' | 'manual'
  bodyType: string | null
}): Listing => ({
  id: listing.id,
  title: listing.title,
  make: listing.make,
  model: listing.model,
  year: listing.year,
  price: listing.price,
  mileage: listing.mileage,
  region: listing.region,
  images: listing.coverImage ? [listing.coverImage] : [],
  description: '',
  fuelType: listing.fuelType,
  transmission: listing.transmission,
  bodyType: (listing.bodyType as Listing['bodyType'] | null) ?? 'sedan',
  engineSize: '-',
  color: '-',
  plateNumber: '-',
  wofExpiry: listing.createdAt,
  regoExpiry: listing.createdAt,
  firstRegistered: `${listing.year}-01-01`,
  status: listing.status,
  sellerId: '',
  sellerName: 'Private Seller',
  viewCount: 0,
  favoriteCount: 0,
  createdAt: listing.createdAt,
  updatedAt: listing.createdAt,
})

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { data: luxuryListings = [], isLoading } = trpc.luxuryVehicle.list.useQuery()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const allListings = luxuryListings.map((listing: Parameters<typeof mapLuxuryListing>[0]) =>
    mapLuxuryListing(listing)
  )

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Find Your Perfect Car in New Zealand
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              AI-powered search, smart pricing, and thousands of quality used cars
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search make, model, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button asChild variant="outline">
                <Link to="/plate-check">
                  <Car className="h-4 w-4 mr-2" />
                  Plate Check
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/sell">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sell with AI Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Luxury Highlights</h2>
          <Button asChild variant="ghost">
            <Link to="/search">View All</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allListings.map((listing: Listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
