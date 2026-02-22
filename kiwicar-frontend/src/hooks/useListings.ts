import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { Listing, SearchFilters, SortOption, PaginatedResponse } from '@/types'
import { mockListings, mockUserListings } from '@/data/mock'
import { apiGet } from '@/lib/api'

const PAGE_SIZE = 20
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type ApiEnvelope<T> = { success: boolean; data: T }

type ListingDetailApi = {
  id: string
  plateNumber?: string | null
  make: string
  model: string
  variant?: string | null
  year: number
  mileage: number
  price: number
  description?: string | null
  aiPriceMin?: number | null
  aiPriceMax?: number | null
  aiPriceRecommended?: number | null
  fuelType?: Listing['fuelType'] | null
  transmission?: 'auto' | 'manual' | 'automatic' | null
  bodyType?: Listing['bodyType'] | null
  color?: string | null
  engineCC?: number | null
  region: string
  status?: Listing['status'] | null
  wofExpiry?: string | null
  regoExpiry?: string | null
  images?: Array<{ url: string }>
  seller?: {
    id: string
    nickname?: string | null
    avatar?: string | null
    phone?: string | null
    memberSince?: string | null
  } | null
  viewCount?: number | null
  favoriteCount?: number | null
  isFavorited?: boolean | null
  createdAt: string
  updatedAt?: string | null
}

function mapApiListingDetailToListing(payload: ListingDetailApi): Listing {
  const images = (payload.images ?? []).map((image) => image.url).filter(Boolean)
  const transmission =
    payload.transmission === 'auto'
      ? 'automatic'
      : (payload.transmission as Listing['transmission'] | undefined)

  const hasAiRange =
    typeof payload.aiPriceMin === 'number' &&
    typeof payload.aiPriceMax === 'number' &&
    typeof payload.aiPriceRecommended === 'number'

  return {
    id: payload.id,
    title: `${payload.year} ${payload.make} ${payload.model}${payload.variant ? ` ${payload.variant}` : ''}`,
    make: payload.make,
    model: payload.model,
    year: payload.year,
    price: payload.price,
    mileage: payload.mileage,
    region: payload.region,
    images,
    description: payload.description ?? '',
    fuelType: payload.fuelType ?? 'petrol',
    transmission: transmission ?? 'automatic',
    bodyType: payload.bodyType ?? 'sedan',
    engineSize: payload.engineCC ? `${payload.engineCC}cc` : '-',
    color: payload.color ?? '-',
    plateNumber: payload.plateNumber ?? '-',
    wofExpiry: payload.wofExpiry ?? payload.createdAt,
    regoExpiry: payload.regoExpiry ?? payload.createdAt,
    firstRegistered: `${payload.year}-01-01`,
    status: payload.status ?? 'active',
    sellerId: payload.seller?.id ?? '',
    sellerName: payload.seller?.nickname ?? 'Private Seller',
    sellerPhone: payload.seller?.phone ?? undefined,
    sellerAvatar: payload.seller?.avatar ?? undefined,
    isFavorited: Boolean(payload.isFavorited),
    viewCount: payload.viewCount ?? 0,
    favoriteCount: payload.favoriteCount ?? 0,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt ?? payload.createdAt,
    aiPriceEstimate: hasAiRange
      ? {
          min: payload.aiPriceMin as number,
          recommended: payload.aiPriceRecommended as number,
          max: payload.aiPriceMax as number,
          confidence: 0.8,
        }
      : undefined,
  }
}

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
  // Backend does not support "recommended"; omit sort to use backend default ordering.
  if (sort && sort !== 'recommended') params.set('sort', sort)

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
      try {
        const raw = await apiGet<ListingDetailApi | ApiEnvelope<ListingDetailApi>>(
          `/api/v1/listings/${id}`
        )
        const payload = (raw as ApiEnvelope<ListingDetailApi>).success
          ? (raw as ApiEnvelope<ListingDetailApi>).data
          : (raw as ListingDetailApi)
        return mapApiListingDetailToListing(payload)
      } catch {
        await delay(200)
        const listing =
          mockListings.find((l) => l.id === id) || mockUserListings.find((l) => l.id === id)
        if (!listing) {
          throw new Error('Listing not found')
        }
        return listing
      }
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
