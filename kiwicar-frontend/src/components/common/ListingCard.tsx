import { Link } from 'react-router-dom'
import { Heart, MapPin, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Listing } from '@/types'
import { formatPrice, formatMileage, getDaysAgo, cn } from '@/lib/utils'
import { useFavoritesStore } from '@/stores/favorites'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorited(listing.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (favorited) {
      removeFavorite(listing.id)
    } else {
      addFavorite(listing)
    }
  }

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white',
              favorited && 'text-red-500'
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
          </Button>
          {listing.status !== 'active' && (
            <Badge
              variant={listing.status === 'sold' ? 'secondary' : 'destructive'}
              className="absolute top-2 left-2"
            >
              {listing.status === 'sold' ? 'Sold' : 'Removed'}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">{listing.title}</h3>
          </div>

          <p className="text-2xl font-bold text-primary mb-2">{formatPrice(listing.price)}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{formatMileage(listing.mileage)}</span>
            <span className="capitalize">{listing.transmission}</span>
            <span className="capitalize">{listing.fuelType}</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.region}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {getDaysAgo(listing.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3]" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex justify-between pt-3 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
