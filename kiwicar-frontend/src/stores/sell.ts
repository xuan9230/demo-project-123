import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SellDraft, VehicleInfo, PriceEstimate } from '@/types'

interface SellState {
  draft: SellDraft
  priceEstimate: PriceEstimate | null
  setStep: (step: number) => void
  setPlateNumber: (plateNumber: string) => void
  setVehicleInfo: (info: Partial<VehicleInfo>) => void
  addImage: (imageUrl: string) => void
  removeImage: (index: number) => void
  reorderImages: (fromIndex: number, toIndex: number) => void
  setDescription: (description: string) => void
  setPrice: (price: number) => void
  setPriceNegotiable: (negotiable: boolean) => void
  setPriceEstimate: (estimate: PriceEstimate | null) => void
  resetDraft: () => void
}

const initialDraft: SellDraft = {
  step: 1,
  images: [],
  priceNegotiable: false,
}

export const useSellStore = create<SellState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      priceEstimate: null,

      setStep: (step) =>
        set((state) => ({
          draft: { ...state.draft, step },
        })),

      setPlateNumber: (plateNumber) =>
        set((state) => ({
          draft: { ...state.draft, plateNumber },
        })),

      setVehicleInfo: (info) =>
        set((state) => ({
          draft: {
            ...state.draft,
            vehicleInfo: { ...state.draft.vehicleInfo, ...info },
          },
        })),

      addImage: (imageUrl) =>
        set((state) => ({
          draft: {
            ...state.draft,
            images: [...state.draft.images, imageUrl],
          },
        })),

      removeImage: (index) =>
        set((state) => ({
          draft: {
            ...state.draft,
            images: state.draft.images.filter((_, i) => i !== index),
          },
        })),

      reorderImages: (fromIndex, toIndex) =>
        set((state) => {
          const images = [...state.draft.images]
          const [removed] = images.splice(fromIndex, 1)
          images.splice(toIndex, 0, removed)
          return { draft: { ...state.draft, images } }
        }),

      setDescription: (description) =>
        set((state) => ({
          draft: { ...state.draft, description },
        })),

      setPrice: (price) =>
        set((state) => ({
          draft: { ...state.draft, price },
        })),

      setPriceNegotiable: (priceNegotiable) =>
        set((state) => ({
          draft: { ...state.draft, priceNegotiable },
        })),

      setPriceEstimate: (priceEstimate) => set({ priceEstimate }),

      resetDraft: () =>
        set({
          draft: initialDraft,
          priceEstimate: null,
        }),
    }),
    {
      name: 'kiwicar-sell-draft',
    }
  )
)
