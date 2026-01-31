import { useState } from 'react'
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { usePlateCheck, isValidNZPlate } from '@/hooks/usePlateCheck'
import { useSellStore } from '@/stores/sell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function Step1PlateNumber() {
  const { draft, setPlateNumber, setVehicleInfo, setStep } = useSellStore()
  const [plateInput, setPlateInput] = useState(draft.plateNumber || '')
  const plateCheckMutation = usePlateCheck()

  const handleSearch = () => {
    const cleaned = plateInput.toUpperCase().replace(/\s/g, '')
    if (!isValidNZPlate(cleaned)) {
      alert('Please enter a valid NZ plate number (e.g., ABC123)')
      return
    }

    plateCheckMutation.mutate(cleaned, {
      onSuccess: (data) => {
        setPlateNumber(cleaned)
        setVehicleInfo({
          plateNumber: data.plateNumber,
          make: data.make,
          model: data.model,
          year: data.year,
          engineSize: data.engineSize,
          fuelType: data.fuelType,
          bodyType: data.bodyType,
          color: data.color,
          firstRegistered: data.firstRegistered,
        })
      },
    })
  }

  const handleContinue = () => {
    setStep(2)
  }

  const handleManualEntry = () => {
    // For now, just continue - in a real app, would show manual entry form
    setPlateNumber(plateInput.toUpperCase())
    setStep(2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Enter Vehicle Plate Number</h2>
        <p className="text-muted-foreground">
          We'll automatically fetch your vehicle details from NZTA records
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="plate">Plate Number</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="plate"
              type="text"
              placeholder="ABC123"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="text-lg font-mono uppercase"
              maxLength={7}
              disabled={plateCheckMutation.isPending || plateCheckMutation.isSuccess}
            />
            <Button
              onClick={handleSearch}
              disabled={plateCheckMutation.isPending || plateCheckMutation.isSuccess}
              size="lg"
            >
              {plateCheckMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error state */}
        {plateCheckMutation.isError && (
          <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Vehicle Not Found</p>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                  {plateCheckMutation.error?.message}
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleManualEntry}>
                  Continue with Manual Entry
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Success state */}
        {plateCheckMutation.isSuccess && plateCheckMutation.data && (
          <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">Vehicle Found!</p>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  We've found your vehicle details
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Make & Model:</span>
                <span className="font-semibold">
                  {plateCheckMutation.data.make} {plateCheckMutation.data.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year:</span>
                <span className="font-semibold">{plateCheckMutation.data.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engine:</span>
                <span className="font-semibold capitalize">
                  {plateCheckMutation.data.engineSize} {plateCheckMutation.data.fuelType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Body Type:</span>
                <span className="font-semibold capitalize">{plateCheckMutation.data.bodyType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color:</span>
                <span className="font-semibold">{plateCheckMutation.data.color}</span>
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full mt-4" size="lg">
              Continue to Photos
            </Button>
          </Card>
        )}

        {/* Info card */}
        {!plateCheckMutation.isSuccess && !plateCheckMutation.isError && (
          <Card className="p-4 bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Enter your NZ vehicle plate number to automatically fetch details. If your vehicle
              isn't found, you can enter details manually.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
