import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Eye,
  Heart,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  MoreVertical,
  Package,
} from 'lucide-react'
import { useUserListings } from '@/hooks/useListings'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice, formatMileage, getDaysAgo, cn } from '@/lib/utils'
import type { Listing } from '@/types'

type ActionDialog = {
  type: 'markSold' | 'changePrice' | 'remove'
  listing: Listing
} | null

export default function MyListingsPage() {
  const { data: listings, isLoading } = useUserListings()
  const [actionDialog, setActionDialog] = useState<ActionDialog>(null)
  const [newPrice, setNewPrice] = useState<number>(0)

  const handleMarkAsSold = (listing: Listing) => {
    setActionDialog({ type: 'markSold', listing })
  }

  const handleChangePrice = (listing: Listing) => {
    setNewPrice(listing.price)
    setActionDialog({ type: 'changePrice', listing })
  }

  const handleRemoveListing = (listing: Listing) => {
    setActionDialog({ type: 'remove', listing })
  }

  const confirmAction = () => {
    // In real app, would call API
    alert(`Action confirmed: ${actionDialog?.type}`)
    setActionDialog(null)
  }

  const activeListings = listings?.filter((l) => l.status === 'active') || []
  const soldListings = listings?.filter((l) => l.status === 'sold') || []
  const removedListings = listings?.filter((l) => l.status === 'removed') || []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <EmptyState
          icon={Package}
          title="No Listings Yet"
          description="You haven't listed any vehicles for sale. Create your first listing to get started."
          action={
            <Link to="/sell">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Listing
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">
            {activeListings.length} active, {soldListings.length} sold
          </p>
        </div>
        <Link to="/sell">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create New Listing
          </Button>
        </Link>
      </div>

      {/* Active listings */}
      {activeListings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Listings</h2>
          <div className="space-y-4">
            {activeListings.map((listing) => (
              <ListingManagementCard
                key={listing.id}
                listing={listing}
                onMarkAsSold={handleMarkAsSold}
                onChangePrice={handleChangePrice}
                onRemove={handleRemoveListing}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sold listings */}
      {soldListings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Sold Listings</h2>
          <div className="space-y-4">
            {soldListings.map((listing) => (
              <ListingManagementCard
                key={listing.id}
                listing={listing}
                onMarkAsSold={handleMarkAsSold}
                onChangePrice={handleChangePrice}
                onRemove={handleRemoveListing}
              />
            ))}
          </div>
        </div>
      )}

      {/* Removed listings */}
      {removedListings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Removed Listings</h2>
          <div className="space-y-4">
            {removedListings.map((listing) => (
              <ListingManagementCard
                key={listing.id}
                listing={listing}
                onMarkAsSold={handleMarkAsSold}
                onChangePrice={handleChangePrice}
                onRemove={handleRemoveListing}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action dialogs */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'markSold' && 'Mark as Sold'}
              {actionDialog?.type === 'changePrice' && 'Change Price'}
              {actionDialog?.type === 'remove' && 'Remove Listing'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'markSold' &&
                'Mark this listing as sold. It will no longer appear in search results.'}
              {actionDialog?.type === 'changePrice' &&
                'Update the price for this listing. Users with price alerts will be notified if the price drops.'}
              {actionDialog?.type === 'remove' &&
                'Remove this listing from the marketplace. You can relist it later if needed.'}
            </DialogDescription>
          </DialogHeader>

          {actionDialog?.type === 'changePrice' && (
            <div className="py-4">
              <Label htmlFor="new-price">New Price</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="new-price"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                  className="pl-10 text-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Current price: {formatPrice(actionDialog.listing.price)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={confirmAction}>
              {actionDialog?.type === 'markSold' && 'Mark as Sold'}
              {actionDialog?.type === 'changePrice' && 'Update Price'}
              {actionDialog?.type === 'remove' && 'Remove Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ListingManagementCardProps {
  listing: Listing
  onMarkAsSold: (listing: Listing) => void
  onChangePrice: (listing: Listing) => void
  onRemove: (listing: Listing) => void
}

function ListingManagementCard({ listing, onMarkAsSold, onChangePrice, onRemove }: ListingManagementCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Image */}
        <Link to={`/listing/${listing.id}`} className="flex-shrink-0">
          <div className="w-32 h-32 md:w-48 md:h-32 rounded-lg overflow-hidden bg-muted relative">
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
            {listing.status !== 'active' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant={listing.status === 'sold' ? 'default' : 'destructive'}>
                  {listing.status === 'sold' ? 'Sold' : 'Removed'}
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <Link to={`/listing/${listing.id}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">
                  {listing.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatMileage(listing.mileage)} • {listing.region} • Posted {getDaysAgo(listing.createdAt)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link to={`/listing/${listing.id}`}>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Listing
                  </DropdownMenuItem>
                </Link>
                {listing.status === 'active' && (
                  <>
                    <DropdownMenuItem disabled>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Listing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangePrice(listing)}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Change Price
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onMarkAsSold(listing)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Sold
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRemove(listing)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Listing
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-6 mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(listing.price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Views</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {listing.viewCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Favorites</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {listing.favoriteCount}
              </p>
            </div>
          </div>

          {/* Quick actions for active listings */}
          {listing.status === 'active' && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onChangePrice(listing)}>
                <DollarSign className="h-4 w-4 mr-1" />
                Change Price
              </Button>
              <Button variant="outline" size="sm" onClick={() => onMarkAsSold(listing)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark as Sold
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
