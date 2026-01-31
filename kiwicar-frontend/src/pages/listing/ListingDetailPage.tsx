import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Car,
  Shield,
  CreditCard,
  Phone,
  MessageCircle,
  AlertTriangle,
  ChevronLeft,
  Eye,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useListing } from '@/hooks/useListings'
import { useFavoritesStore } from '@/stores/favorites'
import { ImageGallery } from '@/components/common/ImageGallery'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatMileage, getDaysAgo, cn } from '@/lib/utils'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: listing, isLoading, error } = useListing(id!)
  const { addFavorite, removeFavorite, isFavorited } = useFavoritesStore()

  const handleFavoriteToggle = () => {
    if (!listing) return
    if (isFavorited(listing.id)) {
      removeFavorite(listing.id)
    } else {
      addFavorite(listing)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          url,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  const getWofStatus = () => {
    if (!listing?.wofExpiry) return null
    const expiryDate = new Date(listing.wofExpiry)
    const today = new Date()
    const isExpired = expiryDate < today
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      isExpired,
      expiryDate,
      daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    }
  }

  const getRegoStatus = () => {
    if (!listing?.regoExpiry) return null
    const expiryDate = new Date(listing.regoExpiry)
    const today = new Date()
    const isExpired = expiryDate < today
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      isExpired,
      expiryDate,
      daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] rounded-lg" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
          <p className="text-muted-foreground mb-6">This listing may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Browse All Listings</Button>
        </Card>
      </div>
    )
  }

  const wofStatus = getWofStatus()
  const regoStatus = getRegoStatus()
  const favorited = isFavorited(listing.id)
  const daysAgo = getDaysAgo(listing.createdAt)
  const priceVsEstimate =
    listing.aiPriceEstimate && listing.price < listing.aiPriceEstimate.min
      ? 'below'
      : listing.aiPriceEstimate && listing.price > listing.aiPriceEstimate.max
        ? 'above'
        : 'within'

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 -ml-4"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <ImageGallery images={listing.images} alt={listing.title} />

          {/* Title and actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.region}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {daysAgo}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{listing.viewCount} views</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavoriteToggle}
                className={cn(favorited && 'text-red-500 border-red-500')}
              >
                <Heart className={cn('h-5 w-5', favorited && 'fill-red-500')} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Vehicle specifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold">{listing.year}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gauge className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="font-semibold">{formatMileage(listing.mileage)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Fuel className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-semibold capitalize">{listing.fuelType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p className="font-semibold capitalize">{listing.transmission}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Body Type</p>
                  <p className="font-semibold capitalize">{listing.bodyType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Engine Size</p>
                  <p className="font-semibold">{listing.engineSize}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-semibold">{listing.color}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Plate Number</p>
                  <p className="font-semibold">{listing.plateNumber}</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* WOF and Rego status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                {wofStatus?.isExpired ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">WOF Status</p>
                  <p className="font-semibold">
                    {wofStatus?.isExpired ? 'Expired' : 'Valid'} until{' '}
                    {new Date(listing.wofExpiry).toLocaleDateString('en-NZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {wofStatus?.isExpiringSoon && (
                    <Badge variant="outline" className="mt-1 text-orange-600 border-orange-600">
                      Expires in {wofStatus.daysUntilExpiry} days
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {regoStatus?.isExpired ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Rego Status</p>
                  <p className="font-semibold">
                    {regoStatus?.isExpired ? 'Expired' : 'Valid'} until{' '}
                    {new Date(listing.regoExpiry).toLocaleDateString('en-NZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {regoStatus?.isExpiringSoon && (
                    <Badge variant="outline" className="mt-1 text-orange-600 border-orange-600">
                      Expires in {regoStatus.daysUntilExpiry} days
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
          </Card>

          {/* AI Price Analysis */}
          {listing.aiPriceEstimate && (
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h2 className="text-xl font-semibold">AI Price Analysis</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on similar vehicles in the market
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Market Range</span>
                  <span className="font-medium">
                    {formatPrice(listing.aiPriceEstimate.min)} - {formatPrice(listing.aiPriceEstimate.max)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recommended Price</span>
                  <span className="font-semibold text-lg">
                    {formatPrice(listing.aiPriceEstimate.recommended)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="font-medium">{Math.round(listing.aiPriceEstimate.confidence * 100)}%</span>
                </div>

                {priceVsEstimate === 'below' && (
                  <Badge variant="default" className="w-full justify-center py-2 bg-green-600">
                    Great Deal! Below market average
                  </Badge>
                )}
                {priceVsEstimate === 'within' && (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Fair Price - Within market range
                  </Badge>
                )}
                {priceVsEstimate === 'above' && (
                  <Badge variant="outline" className="w-full justify-center py-2 border-orange-500 text-orange-600">
                    Above market average
                  </Badge>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Price card */}
          <Card className="p-6 sticky top-6">
            <div className="text-4xl font-bold text-primary mb-6">{formatPrice(listing.price)}</div>

            {/* Seller info */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Seller</p>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={listing.sellerAvatar} />
                  <AvatarFallback>{listing.sellerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{listing.sellerName}</p>
                  <p className="text-sm text-muted-foreground">{listing.region}</p>
                </div>
              </div>

              {listing.sellerPhone && (
                <a href={`tel:${listing.sellerPhone}`} className="block w-full">
                  <Button className="w-full" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    {listing.sellerPhone}
                  </Button>
                </a>
              )}

              <Button variant="outline" className="w-full mt-2" size="lg" disabled>
                <MessageCircle className="h-5 w-5 mr-2" />
                Send Message
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Messaging feature coming soon
              </p>
            </div>

            <Separator className="my-6" />

            {/* Additional info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  First registered:{' '}
                  {new Date(listing.firstRegistered).toLocaleDateString('en-NZ', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{listing.favoriteCount} people favorited this</span>
              </div>
            </div>

            <Separator className="my-6" />

            <Button variant="ghost" className="w-full text-muted-foreground" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report this listing
            </Button>
          </Card>

          {/* Plate check CTA */}
          <Card className="p-6 bg-muted">
            <h3 className="font-semibold mb-2">Want to check a vehicle?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Look up WOF, registration, and history for any NZ vehicle
            </p>
            <Link to="/plate-check">
              <Button variant="secondary" className="w-full">
                Check Vehicle Plate
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
