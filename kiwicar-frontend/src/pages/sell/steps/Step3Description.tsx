import { useEffect } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { useAIDescription } from '@/hooks/usePlateCheck'
import { useSellStore } from '@/stores/sell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const MAX_CHARS = 1000

export default function Step3Description() {
  const { draft, setDescription, setStep } = useSellStore()
  const aiDescriptionMutation = useAIDescription()

  const generateDescription = () => {
    if (!draft.vehicleInfo) {
      alert('Vehicle information is missing')
      return
    }

    // Convert partial vehicle info to full VehicleInfo for the mutation
    const vehicleInfo = {
      plateNumber: draft.vehicleInfo.plateNumber || draft.plateNumber || '',
      make: draft.vehicleInfo.make || '',
      model: draft.vehicleInfo.model || '',
      year: draft.vehicleInfo.year || new Date().getFullYear(),
      engineSize: draft.vehicleInfo.engineSize || '',
      fuelType: draft.vehicleInfo.fuelType || 'petrol',
      bodyType: draft.vehicleInfo.bodyType || 'sedan',
      color: draft.vehicleInfo.color || '',
      wofStatus: draft.vehicleInfo.wofStatus || 'unknown',
      wofExpiry: draft.vehicleInfo.wofExpiry || '',
      regoStatus: draft.vehicleInfo.regoStatus || 'unknown',
      regoExpiry: draft.vehicleInfo.regoExpiry || '',
      firstRegistered: draft.vehicleInfo.firstRegistered || '',
      odometerReadings: draft.vehicleInfo.odometerReadings || [],
    }

    aiDescriptionMutation.mutate(vehicleInfo, {
      onSuccess: (description) => {
        setDescription(description)
      },
    })
  }

  const handleContinue = () => {
    if (!draft.description || draft.description.trim().length < 50) {
      alert('Please write a description (at least 50 characters)')
      return
    }
    setStep(4)
  }

  const charCount = draft.description?.length || 0
  const isOverLimit = charCount > MAX_CHARS

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Add Description</h2>
        <p className="text-muted-foreground">
          Let AI generate a compelling description, or write your own
        </p>
      </div>

      {/* AI Generate button */}
      {!draft.description && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">AI-Powered Description</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let our AI create an engaging description based on your vehicle details
              </p>
              <Button
                onClick={generateDescription}
                disabled={aiDescriptionMutation.isPending}
                size="lg"
              >
                {aiDescriptionMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Description
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Description textarea */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your vehicle's condition, features, and selling points..."
          value={draft.description || ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={12}
          className="resize-none"
        />
        <div className="flex justify-between items-center text-sm">
          <span className={isOverLimit ? 'text-red-600' : 'text-muted-foreground'}>
            {charCount} / {MAX_CHARS} characters
          </span>
          {draft.description && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateDescription}
              disabled={aiDescriptionMutation.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* Tips */}
      <Card className="p-4 bg-muted">
        <p className="text-sm font-semibold mb-2">Writing Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Highlight unique features and recent maintenance</li>
          <li>Be honest about the vehicle's condition</li>
          <li>Mention included accessories or extras</li>
          <li>Describe the reason for selling</li>
          <li>Keep it clear and concise</li>
        </ul>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!draft.description || draft.description.trim().length < 50 || isOverLimit}
          size="lg"
        >
          Continue to Pricing
        </Button>
      </div>

      {draft.description && draft.description.trim().length < 50 && (
        <p className="text-sm text-muted-foreground text-center">
          Description must be at least 50 characters
        </p>
      )}
    </div>
  )
}
