import type { Listing, SearchFilters, SortOption } from '@/types'
import { trpc } from '@/lib/trpc'

const PAGE_SIZE = 20
type TransmissionFilter = NonNullable<SearchFilters['transmissions']>[number]

type ListingsPage = {
  data: Listing[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
  nextCursor?: number
}

const mapSort = (sort: SortOption): 'price_asc' | 'price_desc' | 'newest' | 'mileage_asc' | undefined => {
  if (sort === 'recommended') {
    return undefined
  }

  return sort
}

const mapTransmissionInput = (value?: TransmissionFilter) => {
  if (!value) {
    return undefined
  }

  return value === 'automatic' ? 'auto' : value
}

const mapListingSummary = (listing: {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  region: string
  coverImage: string | null
  createdAt: string
  status: 'active' | 'sold' | 'removed'
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric'
  transmission: 'automatic' | 'manual'
  bodyType: string | null
  isFavorited: boolean
}): Listing => ({
  id: listing.id,
  title: listing.title,
  make: listing.make,
  model: listing.model,
  year: listing.year,
  price: listing.price,
  mileage: listing.mileage,
  region: listing.region,
  images: listing.coverImage ? [listing.coverImage] : [],
  description: '',
  fuelType: listing.fuelType,
  transmission: listing.transmission,
  bodyType: (listing.bodyType as Listing['bodyType'] | null) ?? 'sedan',
  engineSize: '-',
  color: '-',
  plateNumber: '-',
  wofExpiry: listing.createdAt,
  regoExpiry: listing.createdAt,
  firstRegistered: `${listing.year}-01-01`,
  status: listing.status,
  sellerId: '',
  sellerName: 'Private Seller',
  isFavorited: listing.isFavorited,
  viewCount: 0,
  favoriteCount: 0,
  createdAt: listing.createdAt,
  updatedAt: listing.createdAt,
})

export function useListings(filters: SearchFilters = {}, sort: SortOption = 'recommended') {
  return trpc.listings.list.useInfiniteQuery(
    {
      limit: PAGE_SIZE,
      search: filters.query,
      make: filters.makes?.length ? filters.makes.join(',') : undefined,
      model: filters.models?.length ? filters.models.join(',') : undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minYear: filters.minYear,
      maxYear: filters.maxYear,
      minMileage: filters.minMileage,
      maxMileage: filters.maxMileage,
      region: filters.regions?.length ? filters.regions.join(',') : undefined,
      fuelType: filters.fuelTypes?.[0],
      transmission: mapTransmissionInput(filters.transmissions?.[0]),
      bodyType: filters.bodyTypes?.[0],
      sort: mapSort(sort),
    },
    {
      initialCursor: 1,
      getNextPageParam: (lastPage: { nextCursor?: number }) => lastPage.nextCursor,
      select: (data: any) => ({
        ...data,
        pages: data.pages.map((page: any): ListingsPage => ({
          data: page.data.map((listing: any) => mapListingSummary(listing)),
          meta: {
            page: page.meta.page,
            perPage: page.meta.limit,
            total: page.meta.total,
            totalPages: page.meta.totalPages,
          },
          nextCursor: page.nextCursor,
        })),
      }),
    }
  )
}

export function useListing(id: string) {
  return trpc.listings.getById.useQuery(
    { id },
    {
      enabled: !!id,
      select: (listing: any): Listing => ({
        id: listing.id,
        title: listing.title,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        price: listing.price,
        mileage: listing.mileage,
        region: listing.region,
        images: listing.images,
        description: listing.description,
        fuelType: listing.fuelType,
        transmission: listing.transmission,
        bodyType: (listing.bodyType as Listing['bodyType'] | null) ?? 'sedan',
        engineSize: listing.engineSize,
        color: listing.color ?? '-',
        plateNumber: listing.plateNumber,
        wofExpiry: listing.wofExpiry ?? listing.createdAt,
        regoExpiry: listing.regoExpiry ?? listing.createdAt,
        firstRegistered: listing.firstRegistered,
        status: listing.status,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        sellerPhone: listing.sellerPhone ?? undefined,
        sellerAvatar: listing.sellerAvatar ?? undefined,
        isFavorited: listing.isFavorited,
        viewCount: listing.viewCount,
        favoriteCount: listing.favoriteCount,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        aiPriceEstimate:
          typeof listing.aiPriceMin === 'number' &&
          typeof listing.aiPriceMax === 'number' &&
          typeof listing.aiPriceRecommended === 'number'
            ? {
                min: listing.aiPriceMin,
                recommended: listing.aiPriceRecommended,
                max: listing.aiPriceMax,
                confidence: 0.8,
              }
            : undefined,
      }),
    }
  )
}

export function useUserListings() {
  return trpc.listings.myListings.useQuery(undefined, {
    select: (listings: any[]): Listing[] => listings.map((listing: any) => ({
      ...listing,
      bodyType: listing.bodyType as Listing['bodyType'],
      status: listing.status as Listing['status'],
      sellerPhone: listing.sellerPhone ?? undefined,
      sellerAvatar: listing.sellerAvatar ?? undefined,
    })),
  })
}
