import { useEffect } from 'react'
import { TrendingUp, DollarSign, HelpCircle } from 'lucide-react'
import { useAIPricing } from '@/hooks/usePlateCheck'
import { useSellStore } from '@/stores/sell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { formatPrice, cn } from '@/lib/utils'

export default function Step4Pricing() {
  const { draft, setPrice, setPriceNegotiable, priceEstimate, setPriceEstimate, setStep } = useSellStore()
  const aiPricingMutation = useAIPricing()

  useEffect(() => {
    // Auto-generate price estimate if we have vehicle info and don't have estimate yet
    if (draft.vehicleInfo && !priceEstimate && !aiPricingMutation.isPending) {
      const vehicleInfo = draft.vehicleInfo
      if (vehicleInfo.make && vehicleInfo.model && vehicleInfo.year) {
        aiPricingMutation.mutate(
          {
            make: vehicleInfo.make,
            model: vehicleInfo.model,
            year: vehicleInfo.year,
            mileage: 50000, // Default mileage, should ask user
          },
          {
            onSuccess: (estimate) => {
              setPriceEstimate(estimate)
              if (!draft.price) {
                setPrice(estimate.recommended)
              }
            },
          }
        )
      }
    }
  }, [draft.vehicleInfo, priceEstimate])

  const handleContinue = () => {
    if (!draft.price || draft.price < 1000) {
      alert('Please enter a valid price (minimum $1,000)')
      return
    }
    setStep(5)
  }

  const handlePriceChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''))
    if (!isNaN(numValue)) {
      setPrice(numValue)
    } else {
      setPrice(0)
    }
  }

  const getPriceStatus = () => {
    if (!priceEstimate || !draft.price) return null

    if (draft.price < priceEstimate.min) {
      return { label: 'Below Market Range', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' }
    } else if (draft.price > priceEstimate.max) {
      return { label: 'Above Market Range', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' }
    } else {
      return { label: 'Within Market Range', color: 'text-green-600', bg: 'bg-green-50 border-green-200' }
    }
  }

  const priceStatus = getPriceStatus()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Set Your Price</h2>
        <p className="text-muted-foreground">
          Based on similar vehicles, we recommend a competitive price
        </p>
      </div>

      {/* AI Price Estimate */}
      {aiPricingMutation.isPending && (
        <Card className="p-6 bg-primary/5">
          <div className="text-center">
            <span className="animate-spin text-2xl">⏳</span>
            <p className="text-sm text-muted-foreground mt-2">Analyzing market prices...</p>
          </div>
        </Card>
      )}

      {priceEstimate && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">AI Price Recommendation</h3>
              <p className="text-sm text-muted-foreground">
                Based on {Math.round(priceEstimate.confidence * 100)}% confidence
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Market Range</span>
              <span className="font-medium">
                {formatPrice(priceEstimate.min)} - {formatPrice(priceEstimate.max)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Recommended Price</span>
              <span className="font-bold text-2xl text-primary">
                {formatPrice(priceEstimate.recommended)}
              </span>
            </div>

            {!draft.price && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPrice(priceEstimate.recommended)}
              >
                Use Recommended Price
              </Button>
            )}
          </div>

          {/* Price visualization slider */}
          <div className="mt-6">
            <div className="relative h-2 bg-gradient-to-r from-orange-200 via-green-200 to-orange-200 rounded-full">
              {draft.price && priceEstimate && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"
                  style={{
                    left: `${Math.max(0, Math.min(100, ((draft.price - priceEstimate.min) / (priceEstimate.max - priceEstimate.min)) * 100))}%`,
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Min</span>
              <span>Recommended</span>
              <span>Max</span>
            </div>
          </div>
        </Card>
      )}

      {/* Price input */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-base">
          Your Asking Price
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="price"
            type="text"
            placeholder="25,000"
            value={draft.price ? draft.price.toLocaleString() : ''}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="pl-10 text-2xl font-bold"
          />
        </div>

        {priceStatus && draft.price && (
          <Card className={cn('p-3', priceStatus.bg)}>
            <p className={cn('text-sm font-medium', priceStatus.color)}>
              {priceStatus.label}
            </p>
          </Card>
        )}
      </div>

      {/* Price negotiable checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="negotiable"
          checked={draft.priceNegotiable}
          onCheckedChange={(checked) => setPriceNegotiable(checked as boolean)}
        />
        <label
          htmlFor="negotiable"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Price is negotiable
        </label>
      </div>

      {/* Tips */}
      <Card className="p-4 bg-muted">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-2">
            <p className="font-semibold">Pricing Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Price within the recommended range sells faster</li>
              <li>Slightly below market attracts more buyers</li>
              <li>Leave room for negotiation</li>
              <li>Consider your vehicle's condition when pricing</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!draft.price || draft.price < 1000}
          size="lg"
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  )
}
