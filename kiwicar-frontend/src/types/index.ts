// User types
export interface User {
  id: string
  email: string
  phone?: string
  nickname: string
  avatar?: string
  region: string
  createdAt: string
  showPhoneOnListings: boolean
}

// Vehicle / Listing types
export interface Listing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  region: string
  images: string[]
  description: string
  fuelType: FuelType
  transmission: Transmission
  bodyType: BodyType
  engineSize: string
  color: string
  plateNumber: string
  wofExpiry: string
  regoExpiry: string
  firstRegistered: string
  status: ListingStatus
  sellerId: string
  sellerName: string
  sellerPhone?: string
  sellerAvatar?: string
  isFavorited?: boolean
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
  aiPriceEstimate?: PriceEstimate
}

export type ListingStatus = 'active' | 'sold' | 'removed' | 'draft'

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric'

export type Transmission = 'automatic' | 'manual'

export type BodyType =
  | 'sedan'
  | 'suv'
  | 'hatchback'
  | 'wagon'
  | 'ute'
  | 'van'
  | 'coupe'
  | 'convertible'

// Price estimate from AI
export interface PriceEstimate {
  min: number
  recommended: number
  max: number
  confidence: number
}

// Vehicle lookup (NZTA data)
export interface VehicleInfo {
  plateNumber: string
  make: string
  model: string
  year: number
  engineSize: string
  fuelType: FuelType
  bodyType: BodyType
  color: string
  wofStatus: 'valid' | 'expired' | 'unknown'
  wofExpiry: string
  regoStatus: 'valid' | 'expired' | 'unknown'
  regoExpiry: string
  firstRegistered: string
  odometerReadings: OdometerReading[]
}

export interface OdometerReading {
  date: string
  km: number
}

// Search / Filter types
export interface SearchFilters {
  query?: string
  makes?: string[]
  models?: string[]
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  minMileage?: number
  maxMileage?: number
  regions?: string[]
  fuelTypes?: FuelType[]
  transmissions?: Transmission[]
  bodyTypes?: BodyType[]
}

export type SortOption =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'mileage_asc'

// Favorite types
export interface Favorite {
  id: string
  listingId: string
  listing: Listing
  priceAlertEnabled: boolean
  targetPrice?: number
  createdAt: string
}

// Sell flow types
export interface SellDraft {
  step: number
  plateNumber?: string
  vehicleInfo?: Partial<VehicleInfo>
  images: string[]
  description?: string
  price?: number
  priceNegotiable?: boolean
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// NZ Regions
export const NZ_REGIONS = [
  'Auckland',
  'Bay of Plenty',
  'Canterbury',
  'Gisborne',
  'Hawkes Bay',
  'Manawatu-Whanganui',
  'Marlborough',
  'Nelson',
  'Northland',
  'Otago',
  'Southland',
  'Taranaki',
  'Tasman',
  'Waikato',
  'Wellington',
  'West Coast',
] as const

export type NZRegion = (typeof NZ_REGIONS)[number]

// Popular car makes in NZ
export const CAR_MAKES = [
  'Toyota',
  'Mazda',
  'Nissan',
  'Honda',
  'Ford',
  'Holden',
  'Mitsubishi',
  'Subaru',
  'Suzuki',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
] as const

// Models by make (simplified subset)
export const CAR_MODELS: Record<string, string[]> = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Yaris', 'Prius', 'Land Cruiser', 'Highlander'],
  Mazda: ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5', 'CX-3', 'BT-50'],
  Nissan: ['X-Trail', 'Qashqai', 'Navara', 'Leaf', 'Juke', 'Pathfinder', 'Note'],
  Honda: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'City', 'Odyssey'],
  Ford: ['Ranger', 'Focus', 'Escape', 'Mustang', 'Everest', 'Fiesta', 'Mondeo'],
  Holden: ['Commodore', 'Colorado', 'Captiva', 'Cruze', 'Trax', 'Astra'],
  Mitsubishi: ['Outlander', 'ASX', 'Triton', 'Pajero', 'Eclipse Cross', 'Lancer'],
  Subaru: ['Outback', 'Forester', 'XV', 'Impreza', 'Legacy', 'WRX', 'BRZ'],
  Suzuki: ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Baleno', 'Ignis'],
  Hyundai: ['i30', 'Tucson', 'Santa Fe', 'Kona', 'i20', 'Ioniq', 'Venue'],
  Kia: ['Sportage', 'Seltos', 'Cerato', 'Sorento', 'Carnival', 'Rio', 'Stinger'],
  Volkswagen: ['Golf', 'Tiguan', 'Polo', 'Passat', 'T-Cross', 'Amarok'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', '1 Series', 'X1'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'A-Class', 'GLC', 'GLE', 'CLA'],
  Audi: ['A3', 'A4', 'Q5', 'Q3', 'A6', 'Q7'],
}
