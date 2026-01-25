import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ListingCard, ListingCardSkeleton } from '@/components/common/ListingCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useListings } from '@/hooks/useListings'
import type { SearchFilters, SortOption } from '@/types'
import { CAR_MAKES, CAR_MODELS, NZ_REGIONS } from '@/types'
import { Search } from 'lucide-react'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'mileage_asc', label: 'Mileage: Low to High' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { ref, inView } = useInView()
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Parse filters from URL
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: searchParams.get('query') || undefined,
    makes: searchParams.get('makes')?.split(',').filter(Boolean) || undefined,
    models: searchParams.get('models')?.split(',').filter(Boolean) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minYear: searchParams.get('minYear') ? Number(searchParams.get('minYear')) : undefined,
    maxYear: searchParams.get('maxYear') ? Number(searchParams.get('maxYear')) : undefined,
    regions: searchParams.get('regions')?.split(',').filter(Boolean) || undefined,
  }))

  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'recommended'
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useListings(
    filters,
    sort
  )

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set('query', filters.query)
    if (filters.makes?.length) params.set('makes', filters.makes.join(','))
    if (filters.models?.length) params.set('models', filters.models.join(','))
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    if (filters.minYear) params.set('minYear', String(filters.minYear))
    if (filters.maxYear) params.set('maxYear', String(filters.maxYear))
    if (filters.regions?.length) params.set('regions', filters.regions.join(','))
    if (sort !== 'recommended') params.set('sort', sort)
    setSearchParams(params, { replace: true })
  }, [filters, sort, setSearchParams])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allListings = data?.pages.flatMap((page) => page.data) ?? []
  const totalCount = data?.pages[0]?.meta.total ?? 0

  // Available models based on selected makes
  const availableModels = filters.makes?.length
    ? filters.makes.flatMap((make) => CAR_MODELS[make] || [])
    : []

  // Active filters count
  const activeFiltersCount = [
    filters.makes?.length,
    filters.models?.length,
    filters.minPrice,
    filters.maxPrice,
    filters.minYear,
    filters.maxYear,
    filters.regions?.length,
  ].filter(Boolean).length

  const clearFilters = () => {
    setFilters({ query: filters.query })
  }

  const toggleMake = (make: string) => {
    setFilters((prev) => {
      const makes = prev.makes || []
      const newMakes = makes.includes(make) ? makes.filter((m) => m !== make) : [...makes, make]
      return { ...prev, makes: newMakes.length ? newMakes : undefined, models: undefined }
    })
  }

  const toggleRegion = (region: string) => {
    setFilters((prev) => {
      const regions = prev.regions || []
      const newRegions = regions.includes(region)
        ? regions.filter((r) => r !== region)
        : [...regions, region]
      return { ...prev, regions: newRegions.length ? newRegions : undefined }
    })
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Make filter */}
      <div>
        <Label className="text-base font-semibold">Make</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {CAR_MAKES.slice(0, 10).map((make) => (
            <div key={make} className="flex items-center space-x-2">
              <Checkbox
                id={`make-${make}`}
                checked={filters.makes?.includes(make) || false}
                onCheckedChange={() => toggleMake(make)}
              />
              <label htmlFor={`make-${make}`} className="text-sm cursor-pointer">
                {make}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Model filter (only if makes selected) */}
      {availableModels.length > 0 && (
        <>
          <div>
            <Label className="text-base font-semibold">Model</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
              {availableModels.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model}`}
                    checked={filters.models?.includes(model) || false}
                    onCheckedChange={() => {
                      setFilters((prev) => {
                        const models = prev.models || []
                        const newModels = models.includes(model)
                          ? models.filter((m) => m !== model)
                          : [...models, model]
                        return { ...prev, models: newModels.length ? newModels : undefined }
                      })
                    }}
                  />
                  <label htmlFor={`model-${model}`} className="text-sm cursor-pointer">
                    {model}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Price range */}
      <div>
        <Label className="text-base font-semibold">Price Range</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
      </div>

      <Separator />

      {/* Year range */}
      <div>
        <Label className="text-base font-semibold">Year Range</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            placeholder="From"
            value={filters.minYear || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minYear: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="To"
            value={filters.maxYear || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxYear: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
      </div>

      <Separator />

      {/* Region filter */}
      <div>
        <Label className="text-base font-semibold">Region</Label>
        <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
          {NZ_REGIONS.map((region) => (
            <div key={region} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${region}`}
                checked={filters.regions?.includes(region) || false}
                onCheckedChange={() => toggleRegion(region)}
              />
              <label htmlFor={`region-${region}`} className="text-sm cursor-pointer">
                {region}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {filters.query ? `Results for "${filters.query}"` : 'All Listings'}
          </h1>
          <p className="text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'car' : 'cars'} found
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Mobile filter button */}
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>
              <FilterPanel />
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                  Apply
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sort dropdown */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.makes?.map((make) => (
            <Badge key={make} variant="secondary" className="gap-1">
              {make}
              <button onClick={() => toggleMake(make)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.regions?.map((region) => (
            <Badge key={region} variant="secondary" className="gap-1">
              {region}
              <button onClick={() => toggleRegion(region)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, minPrice: undefined, maxPrice: undefined }))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h2>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Results grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : allListings.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No cars found"
              description="Try adjusting your filters or search for something else."
              action={{ label: 'Clear Filters', href: '/search' }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {allListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={ref} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading more...
                  </div>
                )}
                {!hasNextPage && allListings.length > 0 && (
                  <p className="text-muted-foreground">You've seen all results</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
