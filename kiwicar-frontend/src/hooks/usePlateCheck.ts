import { useMutation } from '@tanstack/react-query'
import type { PriceEstimate, VehicleInfo } from '@/types'
import { delay } from '@/lib/utils'
import { trpc } from '@/lib/trpc'

// NZ plate format validation (simplified)
export function isValidNZPlate(plate: string): boolean {
  const cleaned = plate.toUpperCase().replace(/\s/g, '')
  // Standard format: ABC123 or AB1234 or personalised (3-6 chars)
  return /^[A-Z0-9]{3,6}$/.test(cleaned)
}

const hashCode = (value: string) =>
  value.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 0)

const generatePriceEstimate = (make: string, model: string, year: number, mileage: number): PriceEstimate => {
  const base = 12000 + (year - 2000) * 900
  const mileagePenalty = Math.floor(mileage / 1000) * 45
  const nameFactor = hashCode(`${make}${model}`) % 6000
  const recommended = Math.max(1000, base + nameFactor - mileagePenalty)

  return {
    min: Math.round(recommended * 0.9),
    recommended,
    max: Math.round(recommended * 1.12),
    confidence: 0.78,
  }
}

const generateAIDescription = (vehicleInfo: VehicleInfo) =>
  `Well-maintained ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. ` +
  `Finished in ${vehicleInfo.color || 'a clean'} exterior with ${vehicleInfo.fuelType} engine and ${vehicleInfo.bodyType} body style. ` +
  `Ideal for NZ driving with practical ownership costs and reliable daily performance.`

export function usePlateCheck() {
  return trpc.vehicles.lookupByPlate.useMutation()
}

export function useAIPricing() {
  return useMutation({
    mutationFn: async (params: {
      make: string
      model: string
      year: number
      mileage: number
    }): Promise<PriceEstimate> => {
      await delay(900)
      return generatePriceEstimate(params.make, params.model, params.year, params.mileage)
    },
  })
}

export function useAIDescription() {
  return useMutation({
    mutationFn: async (vehicleInfo: VehicleInfo): Promise<string> => {
      await delay(1200)
      return generateAIDescription(vehicleInfo)
    },
  })
}
