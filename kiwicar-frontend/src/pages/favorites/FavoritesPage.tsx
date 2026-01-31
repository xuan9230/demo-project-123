import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Bell, BellOff, Target, TrendingDown, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react'
import { useFavoritesStore } from '@/stores/favorites'
import { ListingCard } from '@/components/common/ListingCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatPrice, cn } from '@/lib/utils'

export default function FavoritesPage() {
  const { favorites, togglePriceAlert, setTargetPrice } = useFavoritesStore()
  const [priceAlertDialog, setPriceAlertDialog] = useState<{
    isOpen: boolean
    favoriteId: string
    listingId: string
    currentPrice: number
    targetPrice: number | undefined
  } | null>(null)

  const handleTogglePriceAlert = (favoriteId: string, listingId: string, currentPrice: number, currentEnabled: boolean, currentTarget?: number) => {
    if (!currentEnabled) {
      // Opening dialog to set target price
      setPriceAlertDialog({
        isOpen: true,
        favoriteId,
        listingId,
        currentPrice,
        targetPrice: currentTarget || Math.round(currentPrice * 0.9),
      })
    } else {
      // Turning off price alert
      togglePriceAlert(listingId, false)
    }
  }

  const handleSavePriceAlert = () => {
    if (priceAlertDialog) {
      setTargetPrice(priceAlertDialog.listingId, priceAlertDialog.targetPrice || 0)
      togglePriceAlert(priceAlertDialog.listingId, true)
      setPriceAlertDialog(null)
    }
  }

  const getPriceChange = (listing: any) => {
    // In a real app, would track price history
    // For now, simulate with random change
    const changePercent = Math.random() > 0.7 ? (Math.random() * 10 - 5) : 0
    return changePercent
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <EmptyState
          icon={Heart}
          title="No Favorites Yet"
          description="Start favoriting listings to keep track of vehicles you're interested in."
          action={
            <Link to="/">
              <Button size="lg">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Browse Listings
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? 'listing' : 'listings'} saved
        </p>
      </div>

      {/* Info card */}
      <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">Price Alerts</p>
            <p className="text-sm text-muted-foreground">
              Enable price alerts to get notified when a listing drops to your target price
            </p>
          </div>
        </div>
      </Card>

      {/* Favorites grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => {
          const priceChange = getPriceChange(favorite.listing)
          const hasDecreased = priceChange < 0
          const hasIncreased = priceChange > 0

          return (
            <div key={favorite.id} className="space-y-3">
              <ListingCard listing={favorite.listing} />

              {/* Price alert card */}
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {favorite.priceAlertEnabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Price Alert</span>
                  </div>
                  <Switch
                    checked={favorite.priceAlertEnabled}
                    onCheckedChange={() =>
                      handleTogglePriceAlert(
                        favorite.id,
                        favorite.listingId,
                        favorite.listing.price,
                        favorite.priceAlertEnabled,
                        favorite.targetPrice
                      )
                    }
                  />
                </div>

                {favorite.priceAlertEnabled && favorite.targetPrice && (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Target className="h-4 w-4" />
                      <span>Target: {formatPrice(favorite.targetPrice)}</span>
                    </div>
                    {favorite.listing.price <= favorite.targetPrice && (
                      <Badge variant="default" className="w-full justify-center bg-green-600">
                        Target price reached!
                      </Badge>
                    )}
                  </div>
                )}

                {/* Price change indicator */}
                {(hasDecreased || hasIncreased) && (
                  <div
                    className={cn(
                      'flex items-center gap-2 text-sm mt-2 p-2 rounded',
                      hasDecreased ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    )}
                  >
                    {hasDecreased ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    <span>
                      {hasDecreased ? 'Decreased' : 'Increased'} by {Math.abs(priceChange).toFixed(1)}%
                    </span>
                  </div>
                )}

                {/* Listing status warning */}
                {favorite.listing.status !== 'active' && (
                  <div className="flex items-center gap-2 text-sm mt-2 p-2 rounded bg-orange-50 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {favorite.listing.status === 'sold' ? 'Listing sold' : 'Listing no longer available'}
                    </span>
                  </div>
                )}
              </Card>
            </div>
          )
        })}
      </div>

      {/* Price alert dialog */}
      {priceAlertDialog && (
        <Dialog open={priceAlertDialog.isOpen} onOpenChange={(open) => !open && setPriceAlertDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Price Alert</DialogTitle>
              <DialogDescription>
                We'll notify you when the price drops to or below your target price
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm text-muted-foreground">Current Price</Label>
                <p className="text-2xl font-bold">{formatPrice(priceAlertDialog.currentPrice)}</p>
              </div>

              <div>
                <Label htmlFor="target-price">Target Price</Label>
                <Input
                  id="target-price"
                  type="number"
                  value={priceAlertDialog.targetPrice}
                  onChange={(e) =>
                    setPriceAlertDialog({
                      ...priceAlertDialog,
                      targetPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="text-lg font-semibold"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {priceAlertDialog.targetPrice &&
                    priceAlertDialog.targetPrice < priceAlertDialog.currentPrice &&
                    `${Math.round(((priceAlertDialog.currentPrice - priceAlertDialog.targetPrice) / priceAlertDialog.currentPrice) * 100)}% below current price`}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPriceAlertDialog(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSavePriceAlert} className="flex-1">
                <Bell className="h-4 w-4 mr-2" />
                Enable Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
