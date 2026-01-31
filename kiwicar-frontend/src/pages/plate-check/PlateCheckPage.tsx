import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Gauge,
  Car,
  Fuel,
  Settings2,
  TrendingUp,
} from 'lucide-react'
import { usePlateCheck, useVehicleInfo, isValidNZPlate } from '@/hooks/usePlateCheck'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function PlateCheckPage() {
  const { plateNumber: urlPlateNumber } = useParams<{ plateNumber?: string }>()
  const navigate = useNavigate()
  const [plateInput, setPlateInput] = useState(urlPlateNumber || '')
  const [searchedPlate, setSearchedPlate] = useState(urlPlateNumber || '')

  const plateCheckMutation = usePlateCheck()
  const { data: vehicleInfo } = useVehicleInfo(searchedPlate)

  useEffect(() => {
    if (urlPlateNumber && urlPlateNumber !== searchedPlate) {
      setPlateInput(urlPlateNumber)
      setSearchedPlate(urlPlateNumber)
      plateCheckMutation.mutate(urlPlateNumber)
    }
  }, [urlPlateNumber])

  const handleSearch = () => {
    const cleaned = plateInput.toUpperCase().replace(/\s/g, '')
    if (!isValidNZPlate(cleaned)) {
      plateCheckMutation.reset()
      alert('Please enter a valid NZ plate number (e.g., ABC123)')
      return
    }

    setSearchedPlate(cleaned)
    navigate(`/plate-check/${cleaned}`, { replace: true })
    plateCheckMutation.mutate(cleaned)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getWofStatus = () => {
    if (!vehicleInfo?.wofExpiry) return null
    const expiryDate = new Date(vehicleInfo.wofExpiry)
    const today = new Date()
    const isExpired = expiryDate < today
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      isExpired,
      isValid: vehicleInfo.wofStatus === 'valid',
      expiryDate,
      daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    }
  }

  const getRegoStatus = () => {
    if (!vehicleInfo?.regoExpiry) return null
    const expiryDate = new Date(vehicleInfo.regoExpiry)
    const today = new Date()
    const isExpired = expiryDate < today
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      isExpired,
      isValid: vehicleInfo.regoStatus === 'valid',
      expiryDate,
      daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    }
  }

  const wofStatus = getWofStatus()
  const regoStatus = getRegoStatus()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Check Vehicle Information</h1>
        <p className="text-muted-foreground text-lg">
          Look up WOF, registration, and history for any NZ vehicle
        </p>
      </div>

      {/* Search card */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="plate-input" className="text-base">
              Enter Plate Number
            </Label>
            <p className="text-sm text-muted-foreground mb-2">Enter a valid NZ plate (e.g., ABC123, XYZ789)</p>
          </div>

          <div className="flex gap-2">
            <Input
              id="plate-input"
              type="text"
              placeholder="ABC123"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="text-lg font-mono uppercase"
              maxLength={7}
            />
            <Button onClick={handleSearch} size="lg" disabled={plateCheckMutation.isPending}>
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

          {/* Query limits info */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Daily limits:</strong> 3 searches for guests, 10 searches for logged-in users
            </p>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {plateCheckMutation.isError && (
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Vehicle Not Found</h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                {plateCheckMutation.error?.message || 'Please check the plate number and try again.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {plateCheckMutation.isSuccess && vehicleInfo && (
        <div className="space-y-6">
          {/* Vehicle header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="inline-block bg-primary/10 text-primary font-mono font-bold text-2xl px-4 py-2 rounded-md mb-3">
                  {vehicleInfo.plateNumber}
                </div>
                <h2 className="text-3xl font-bold">
                  {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                </h2>
              </div>
            </div>

            <Separator className="my-4" />

            {/* WOF and Rego status - Prominent display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card
                className={cn(
                  'p-4',
                  wofStatus?.isValid && !wofStatus.isExpired
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  {wofStatus?.isValid && !wofStatus.isExpired ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold text-lg">WOF</p>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        wofStatus?.isValid && !wofStatus.isExpired ? 'text-green-700' : 'text-red-700'
                      )}
                    >
                      {wofStatus?.isValid && !wofStatus.isExpired ? 'Valid' : 'Expired'}
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  {wofStatus?.isExpired ? 'Expired on ' : 'Valid until '}
                  {new Date(vehicleInfo.wofExpiry).toLocaleDateString('en-NZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {wofStatus?.isExpiringSoon && (
                  <Badge variant="outline" className="mt-2 border-orange-600 text-orange-600">
                    Expires in {wofStatus.daysUntilExpiry} days
                  </Badge>
                )}
              </Card>

              <Card
                className={cn(
                  'p-4',
                  regoStatus?.isValid && !regoStatus.isExpired
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  {regoStatus?.isValid && !regoStatus.isExpired ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold text-lg">Registration</p>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        regoStatus?.isValid && !regoStatus.isExpired ? 'text-green-700' : 'text-red-700'
                      )}
                    >
                      {regoStatus?.isValid && !regoStatus.isExpired ? 'Valid' : 'Expired'}
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  {regoStatus?.isExpired ? 'Expired on ' : 'Valid until '}
                  {new Date(vehicleInfo.regoExpiry).toLocaleDateString('en-NZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {regoStatus?.isExpiringSoon && (
                  <Badge variant="outline" className="mt-2 border-orange-600 text-orange-600">
                    Expires in {regoStatus.daysUntilExpiry} days
                  </Badge>
                )}
              </Card>
            </div>

            {/* Vehicle details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">First Registered</p>
                  <p className="font-semibold">
                    {new Date(vehicleInfo.firstRegistered).toLocaleDateString('en-NZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Engine</p>
                  <p className="font-semibold capitalize">
                    {vehicleInfo.engineSize} {vehicleInfo.fuelType}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Body</p>
                  <p className="font-semibold capitalize">
                    {vehicleInfo.bodyType}, {vehicleInfo.color}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Odometer history */}
          {vehicleInfo.odometerReadings && vehicleInfo.odometerReadings.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Odometer History</h3>
              </div>
              <div className="space-y-3">
                {vehicleInfo.odometerReadings.map((reading, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {new Date(reading.date).toLocaleDateString('en-NZ', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="font-semibold">{reading.km.toLocaleString()} km</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* CTA - List this car */}
          <Card className="p-6 bg-primary text-primary-foreground">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-2">Want to sell this car?</h3>
                <p className="mb-4 opacity-90">
                  List your vehicle on KiwiCar and reach thousands of buyers. Get AI-powered pricing and description
                  generation!
                </p>
                <Link to="/sell">
                  <Button variant="secondary" size="lg">
                    List This Car for Sale
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Additional info */}
          <Card className="p-4 bg-muted">
            <p className="text-sm text-muted-foreground text-center">
              Vehicle information sourced from NZTA records. Data is cached for 24 hours.
            </p>
          </Card>
        </div>
      )}

      {/* Empty state - No search yet */}
      {!searchedPlate && !plateCheckMutation.isPending && !plateCheckMutation.isError && (
        <Card className="p-12 text-center">
          <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Enter a plate number to get started</h3>
          <p className="text-muted-foreground">View WOF status, registration details, and vehicle history</p>
        </Card>
      )}
    </div>
  )
}
