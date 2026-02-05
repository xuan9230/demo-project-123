import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { Listing, SearchFilters, SortOption, PaginatedResponse } from '@/types'
import { mockListings, mockUserListings } from '@/data/mock'
import { apiGet } from '@/lib/api'

const PAGE_SIZE = 20

function filterListings(
  listings: Listing[],
  filters: SearchFilters,
  sort: SortOption
): Listing[] {
  let result = [...listings]

  // Apply filters
  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(
      (l) =>
        l.make.toLowerCase().includes(q) ||
        l.model.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q)
    )
  }

  if (filters.makes?.length) {
    result = result.filter((l) => filters.makes!.includes(l.make))
  }

  if (filters.models?.length) {
    result = result.filter((l) => filters.models!.includes(l.model))
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((l) => l.price >= filters.minPrice!)
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((l) => l.price <= filters.maxPrice!)
  }

  if (filters.minYear !== undefined) {
    result = result.filter((l) => l.year >= filters.minYear!)
  }

  if (filters.maxYear !== undefined) {
    result = result.filter((l) => l.year <= filters.maxYear!)
  }

  if (filters.minMileage !== undefined) {
    result = result.filter((l) => l.mileage >= filters.minMileage!)
  }

  if (filters.maxMileage !== undefined) {
    result = result.filter((l) => l.mileage <= filters.maxMileage!)
  }

  if (filters.regions?.length) {
    result = result.filter((l) => filters.regions!.includes(l.region))
  }

  if (filters.fuelTypes?.length) {
    result = result.filter((l) => filters.fuelTypes!.includes(l.fuelType))
  }

  if (filters.transmissions?.length) {
    result = result.filter((l) => filters.transmissions!.includes(l.transmission))
  }

  if (filters.bodyTypes?.length) {
    result = result.filter((l) => filters.bodyTypes!.includes(l.bodyType))
  }

  // Apply sorting
  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'mileage_asc':
      result.sort((a, b) => a.mileage - b.mileage)
      break
    case 'recommended':
    default:
      // Mix of recency and popularity
      result.sort((a, b) => {
        const scoreA = a.viewCount + a.favoriteCount * 2
        const scoreB = b.viewCount + b.favoriteCount * 2
        return scoreB - scoreA
      })
  }

  return result
}

async function fetchListings(
  page: number,
  filters: SearchFilters,
  sort: SortOption
): Promise<PaginatedResponse<Listing>> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('perPage', String(PAGE_SIZE))

  if (filters.query) params.set('query', filters.query)
  if (filters.makes?.length) params.set('makes', filters.makes.join(','))
  if (filters.models?.length) params.set('models', filters.models.join(','))
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
  if (filters.minYear !== undefined) params.set('minYear', String(filters.minYear))
  if (filters.maxYear !== undefined) params.set('maxYear', String(filters.maxYear))
  if (filters.minMileage !== undefined) params.set('minMileage', String(filters.minMileage))
  if (filters.maxMileage !== undefined) params.set('maxMileage', String(filters.maxMileage))
  if (filters.regions?.length) params.set('regions', filters.regions.join(','))
  if (filters.fuelTypes?.length) params.set('fuelTypes', filters.fuelTypes.join(','))
  if (filters.transmissions?.length) params.set('transmissions', filters.transmissions.join(','))
  if (filters.bodyTypes?.length) params.set('bodyTypes', filters.bodyTypes.join(','))
  if (sort) params.set('sort', sort)

  type ListingsResponse =
    | Listing[]
    | PaginatedResponse<Listing>
    | { success: boolean; data: Listing[] | PaginatedResponse<Listing> }

  const raw = await apiGet<ListingsResponse>(`/api/v1/listings?${params.toString()}`)
  const payload = (raw as { success?: boolean; data?: unknown }).success ? (raw as any).data : raw

  if (payload && typeof payload === 'object' && 'data' in (payload as any) && 'meta' in (payload as any)) {
    return payload as PaginatedResponse<Listing>
  }

  if (Array.isArray(payload)) {
    const filtered = filterListings(payload, filters, sort)
    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return {
      data: filtered.slice(start, end),
      meta: {
        page,
        perPage: PAGE_SIZE,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / PAGE_SIZE),
      },
    }
  }

  throw new Error('Unexpected listings response shape from API.')
}

export function useListings(filters: SearchFilters = {}, sort: SortOption = 'recommended') {
  return useInfiniteQuery({
    queryKey: ['listings', filters, sort],
    queryFn: ({ pageParam = 1 }) => fetchListings(pageParam, filters, sort),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      await delay(200)
      const listing =
        mockListings.find((l) => l.id === id) || mockUserListings.find((l) => l.id === id)
      if (!listing) {
        throw new Error('Listing not found')
      }
      return listing
    },
  })
}

export function useUserListings() {
  return useQuery({
    queryKey: ['user-listings'],
    queryFn: async () => {
      await delay(300)
      return mockUserListings
    },
  })
}
