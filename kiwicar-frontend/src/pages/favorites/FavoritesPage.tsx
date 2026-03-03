import { useState } from 'react'
import { Heart, Bell, BellOff, Target, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
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
import { trpc } from '@/lib/trpc'

export default function FavoritesPage() {
  const utils = trpc.useUtils()
  const { data: favorites = [] } = trpc.favorites.list.useQuery()
  const updateFavoriteMutation = trpc.favorites.update.useMutation({
    onSuccess: () => {
      void utils.favorites.list.invalidate()
      void utils.listings.list.invalidate()
    },
  })

  const [priceAlertDialog, setPriceAlertDialog] = useState<{
    isOpen: boolean
    favoriteId: string
    currentPrice: number
    targetPrice: number | undefined
  } | null>(null)

  const handleTogglePriceAlert = (
    favoriteId: string,
    currentPrice: number,
    currentEnabled: boolean,
    currentTarget?: number | null
  ) => {
    if (!currentEnabled) {
      setPriceAlertDialog({
        isOpen: true,
        favoriteId,
        currentPrice,
        targetPrice: currentTarget || Math.round(currentPrice * 0.9),
      })
      return
    }

    updateFavoriteMutation.mutate({
      id: favoriteId,
      data: {
        priceAlert: false,
      },
    })
  }

  const handleSavePriceAlert = () => {
    if (!priceAlertDialog) {
      return
    }

    updateFavoriteMutation.mutate(
      {
        id: priceAlertDialog.favoriteId,
        data: {
          targetPrice: priceAlertDialog.targetPrice || 0,
          priceAlert: true,
        },
      },
      {
        onSuccess: () => {
          setPriceAlertDialog(null)
        },
      }
    )
  }

  const getPriceChange = () => {
    const changePercent = Math.random() > 0.7 ? Math.random() * 10 - 5 : 0
    return changePercent
  }

  const favoriteListings = favorites.filter((favorite: { listing: unknown }) => favorite.listing)

  if (favoriteListings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <EmptyState
          icon={Heart}
          title="No Favorites Yet"
          description="Start favoriting listings to keep track of vehicles you're interested in."
          action={{ label: 'Browse Listings', href: '/' }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          {favoriteListings.length} {favoriteListings.length === 1 ? 'listing' : 'listings'} saved
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {favoriteListings.map((favorite: any) => {
          if (!favorite.listing) {
            return null
          }

          const priceChange = getPriceChange()
          const hasDecreased = priceChange < 0
          const hasIncreased = priceChange > 0

          return (
            <div key={favorite.id} className="space-y-3">
              <ListingCard listing={favorite.listing} />

              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {favorite.priceAlert ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Price Alert</span>
                  </div>
                  <Switch
                    checked={Boolean(favorite.priceAlert)}
                    onCheckedChange={() =>
                      handleTogglePriceAlert(
                        favorite.id,
                        Number(favorite.currentPrice || favorite.listing.price),
                        Boolean(favorite.priceAlert),
                        favorite.targetPrice
                      )
                    }
                    disabled={updateFavoriteMutation.isPending}
                  />
                </div>

                {favorite.priceAlert && favorite.targetPrice && (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Target className="h-4 w-4" />
                      <span>Target: {formatPrice(Number(favorite.targetPrice))}</span>
                    </div>
                    {Number(favorite.listing.price) <= Number(favorite.targetPrice) && (
                      <Badge variant="default" className="w-full justify-center bg-green-600">
                        Target price reached!
                      </Badge>
                    )}
                  </div>
                )}

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
                      targetPrice: parseInt(e.target.value, 10) || 0,
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
              <Button onClick={handleSavePriceAlert} className="flex-1" disabled={updateFavoriteMutation.isPending}>
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
