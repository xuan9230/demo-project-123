import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Edit,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Car,
  Sparkles,
} from 'lucide-react'
import { useSellStore } from '@/stores/sell'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatPrice, delay } from '@/lib/utils'

export default function Step5Preview() {
  const navigate = useNavigate()
  const { draft, priceEstimate, resetDraft, setStep } = useSellStore()
  const { user } = useAuthStore()
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)

    // Simulate API call
    await delay(2000)

    setIsPublishing(false)
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    resetDraft()
    navigate('/my-listings')
  }

  const vehicleTitle = draft.vehicleInfo
    ? `${draft.vehicleInfo.year} ${draft.vehicleInfo.make} ${draft.vehicleInfo.model}`
    : 'Vehicle Listing'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Preview Your Listing</h2>
        <p className="text-muted-foreground">
          Review your listing before publishing
        </p>
      </div>

      {/* Preview card - looks like actual listing */}
      <Card className="overflow-hidden">
        {/* Images */}
        <div className="relative aspect-[16/9] bg-muted">
          {draft.images[0] ? (
            <img
              src={draft.images[0]}
              alt={vehicleTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Car className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {draft.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
              1 / {draft.images.length}
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Title and price */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{vehicleTitle}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{user?.region || 'Auckland'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(draft.price || 0)}
              </div>
              {draft.priceNegotiable && (
                <Badge variant="secondary" className="mt-1">
                  Negotiable
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Vehicle specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-semibold">{draft.vehicleInfo?.year || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Fuel className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Fuel</p>
                <p className="font-semibold capitalize">{draft.vehicleInfo?.fuelType || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Engine</p>
                <p className="font-semibold">{draft.vehicleInfo?.engineSize || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Body</p>
                <p className="font-semibold capitalize">{draft.vehicleInfo?.bodyType || '-'}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {draft.description}
            </p>
          </div>

          {/* AI Price comparison */}
          {priceEstimate && (
            <>
              <Separator className="my-4" />
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">AI Price Analysis</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Market range: {formatPrice(priceEstimate.min)} - {formatPrice(priceEstimate.max)}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Edit buttons */}
      <Card className="p-4">
        <p className="text-sm font-semibold mb-3">Need to make changes?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep(1)}>
            <Edit className="h-4 w-4 mr-2" />
            Vehicle
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep(2)}>
            <Edit className="h-4 w-4 mr-2" />
            Photos
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep(3)}>
            <Edit className="h-4 w-4 mr-2" />
            Description
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep(4)}>
            <Edit className="h-4 w-4 mr-2" />
            Price
          </Button>
        </div>
      </Card>

      {/* Publish button */}
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => setStep(4)}>
          Back
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          size="lg"
          className="min-w-[200px]"
        >
          {isPublishing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Publishing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Publish Listing
            </>
          )}
        </Button>
      </div>

      {/* Success dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Listing Published!</DialogTitle>
            <DialogDescription className="text-center">
              Your vehicle listing is now live and visible to thousands of buyers on KiwiCar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Card className="p-4 bg-muted">
              <p className="text-sm text-center text-muted-foreground">
                We'll notify you when someone favorites your listing or sends a message.
              </p>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              View Marketplace
            </Button>
            <Button onClick={handleSuccessClose} className="flex-1">
              View My Listings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
