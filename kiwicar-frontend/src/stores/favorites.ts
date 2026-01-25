import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Favorite, Listing } from '@/types'
import { mockFavorites } from '@/data/mock'

interface FavoritesState {
  favorites: Favorite[]
  addFavorite: (listing: Listing) => void
  removeFavorite: (listingId: string) => void
  isFavorited: (listingId: string) => boolean
  togglePriceAlert: (listingId: string, enabled: boolean) => void
  setTargetPrice: (listingId: string, price: number) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: mockFavorites,

      addFavorite: (listing) =>
        set((state) => {
          if (state.favorites.some((f) => f.listingId === listing.id)) {
            return state
          }
          const newFavorite: Favorite = {
            id: `fav-${Date.now()}`,
            listingId: listing.id,
            listing,
            priceAlertEnabled: false,
            createdAt: new Date().toISOString(),
          }
          return { favorites: [...state.favorites, newFavorite] }
        }),

      removeFavorite: (listingId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.listingId !== listingId),
        })),

      isFavorited: (listingId) => get().favorites.some((f) => f.listingId === listingId),

      togglePriceAlert: (listingId, enabled) =>
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.listingId === listingId ? { ...f, priceAlertEnabled: enabled } : f
          ),
        })),

      setTargetPrice: (listingId, price) =>
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.listingId === listingId ? { ...f, targetPrice: price } : f
          ),
        })),
    }),
    {
      name: 'kiwicar-favorites',
    }
  )
)
