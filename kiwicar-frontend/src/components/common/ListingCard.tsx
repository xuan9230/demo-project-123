import { Link, useNavigate } from 'react-router-dom'
import { Heart, MapPin, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatMileage, getDaysAgo, cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'
import { useAuthStore } from '@/stores/auth'

interface ListingCardListing {
  id: string
  title: string
  price: number
  mileage: number
  region: string
  createdAt: string
  transmission?: string | null
  fuelType?: string | null
  status?: string | null
  images?: string[]
  coverImage?: string | null
  isFavorited?: boolean
}

interface ListingCardProps {
  listing: ListingCardListing
}

export function ListingCard({ listing }: ListingCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const utils = trpc.useUtils()

  const { data: favorites = [] } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      void utils.favorites.list.invalidate()
      void utils.listings.list.invalidate()
      void utils.listings.getById.invalidate()
    },
  })

  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      void utils.favorites.list.invalidate()
      void utils.listings.list.invalidate()
      void utils.listings.getById.invalidate()
    },
  })

  const favoriteRecord = favorites.find((favorite: { id: string; listingId: string }) => favorite.listingId === listing.id)
  const favorited = Boolean(favoriteRecord || listing.isFavorited)
  const isFavoriteMutating = addFavoriteMutation.isPending || removeFavoriteMutation.isPending

  const primaryImage = listing.images?.[0] ?? listing.coverImage ?? null

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate('/auth/login')
      return
    }

    if (favoriteRecord?.id) {
      removeFavoriteMutation.mutate({ id: favoriteRecord.id })
      return
    }

    addFavoriteMutation.mutate({ listingId: listing.id })
  }

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white',
              favorited && 'text-red-500'
            )}
            onClick={handleFavoriteClick}
            disabled={isFavoriteMutating}
          >
            <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
          </Button>
          {listing.status && listing.status !== 'active' && (
            <Badge
              variant={listing.status === 'sold' ? 'secondary' : 'destructive'}
              className="absolute top-2 left-2"
            >
              {listing.status === 'sold' ? 'Sold' : 'Removed'}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">{listing.title}</h3>
          </div>

          <p className="text-2xl font-bold text-primary mb-2">{formatPrice(listing.price)}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{formatMileage(listing.mileage)}</span>
            <span className="capitalize">{listing.transmission || '-'}</span>
            <span className="capitalize">{listing.fuelType || '-'}</span>
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
