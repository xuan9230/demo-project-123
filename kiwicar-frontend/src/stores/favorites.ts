import { create } from 'zustand'

type Favorite = {
  id: string
  listingId: string
  priceAlertEnabled: boolean
  targetPrice?: number
  createdAt: string
}

interface FavoritesState {
  favorites: Favorite[]
  addFavorite: (listing: { id: string }) => void
  removeFavorite: (listingId: string) => void
  isFavorited: (listingId: string) => boolean
  togglePriceAlert: (listingId: string, enabled: boolean) => void
  setTargetPrice: (listingId: string, price: number) => void
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  addFavorite: (listing) =>
    set((state) => {
      if (state.favorites.some((favorite) => favorite.listingId === listing.id)) {
        return state
      }

      return {
        favorites: [
          ...state.favorites,
          {
            id: `fav-${Date.now()}`,
            listingId: listing.id,
            priceAlertEnabled: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    }),

  removeFavorite: (listingId) =>
    set((state) => ({
      favorites: state.favorites.filter((favorite) => favorite.listingId !== listingId),
    })),

  isFavorited: (listingId) => get().favorites.some((favorite) => favorite.listingId === listingId),

  togglePriceAlert: (listingId, enabled) =>
    set((state) => ({
      favorites: state.favorites.map((favorite) =>
        favorite.listingId === listingId ? { ...favorite, priceAlertEnabled: enabled } : favorite
      ),
    })),

  setTargetPrice: (listingId, price) =>
    set((state) => ({
      favorites: state.favorites.map((favorite) =>
        favorite.listingId === listingId ? { ...favorite, targetPrice: price } : favorite
      ),
    })),
}))
