import { useMutation, useQuery } from '@tanstack/react-query'
import type { VehicleInfo, PriceEstimate } from '@/types'
import { mockVehicleLookup, generatePriceEstimate, generateAIDescription } from '@/data/mock'
import { delay } from '@/lib/utils'

// NZ plate format validation (simplified)
export function isValidNZPlate(plate: string): boolean {
  const cleaned = plate.toUpperCase().replace(/\s/g, '')
  // Standard format: ABC123 or AB1234 or personalised (3-6 chars)
  return /^[A-Z0-9]{3,6}$/.test(cleaned)
}

export function usePlateCheck() {
  return useMutation({
    mutationFn: async (plateNumber: string): Promise<VehicleInfo> => {
      await delay(800) // Simulate API call

      const plate = plateNumber.toUpperCase().replace(/\s/g, '')

      if (!isValidNZPlate(plate)) {
        throw new Error('Invalid plate number format')
      }

      const result = mockVehicleLookup[plate]

      if (!result) {
        // Generate mock data for unknown plates
        throw new Error('Vehicle not found. Please check the plate number and try again.')
      }

      return result
    },
  })
}

export function useVehicleInfo(plateNumber: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', plateNumber],
    queryFn: async () => {
      if (!plateNumber) throw new Error('No plate number')
      await delay(500)
      const plate = plateNumber.toUpperCase().replace(/\s/g, '')
      return mockVehicleLookup[plate] || null
    },
    enabled: !!plateNumber,
  })
}

export function useAIPricing() {
  return useMutation({
    mutationFn: async (params: {
      make: string
      model: string
      year: number
      mileage: number
    }): Promise<PriceEstimate> => {
      await delay(1000) // Simulate AI processing
      return generatePriceEstimate(params.make, params.model, params.year, params.mileage)
    },
  })
}

export function useAIDescription() {
  return useMutation({
    mutationFn: async (vehicleInfo: VehicleInfo): Promise<string> => {
      await delay(1500) // Simulate AI processing
      return generateAIDescription(vehicleInfo)
    },
  })
}
