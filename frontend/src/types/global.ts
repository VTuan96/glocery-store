// Shared types used across features
// Feature-specific types live in features/{name}/types.ts

export type SyncStatus = 'pending' | 'synced' | 'conflict'

export type ProductType = 'NORMAL' | 'WEIGHT' | 'SPLIT'

export type UserRole = 'OWNER' | 'STAFF'

export interface PricingTier {
  minQuantity: number
  unitPrice: number
}

export interface Product {
  id?: number           // Dexie auto-increment local id
  clientId: string      // crypto.randomUUID() — used for server sync
  serverId?: string     // server UUID — populated after sync or when fetched from API
  syncStatus: SyncStatus
  storeId: string
  name: string
  type: ProductType
  defaultPrice: number  // VND integer — never decimal
  stockQuantity?: number
  inventoryTracked: boolean
  pricingTiers?: PricingTier[]
  barcodes?: string[]
  createdAt: string     // ISO 8601
  updatedAt: string
}

export interface Customer {
  id?: number
  clientId: string
  syncStatus: SyncStatus
  storeId: string
  name: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id?: number
  clientId: string
  syncStatus: SyncStatus
  productId: string     // references Product.clientId (local)
  productServerId?: string  // server UUID — used in checkout payload
  productName: string
  quantity: number
  unitPrice: number     // VND integer — resolved via resolvePricing()
  originalUnitPrice?: number
  totalPrice: number    // quantity * unitPrice
  priceOverridden: boolean
  overrideToken?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id?: number
  clientId: string      // UNIQUE — idempotency key for server sync
  syncStatus: SyncStatus
  storeId: string
  customerId?: string
  type: 'CASH' | 'DEBT'
  totalAmount: number   // VND integer
  items: TransactionItem[]
  createdAt: string
  updatedAt: string
}

export interface TransactionItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  priceOverridden: boolean
}

export interface DebtRecord {
  id?: number
  clientId: string
  syncStatus: SyncStatus
  storeId: string
  customerId: string
  type: 'DEBT' | 'PAYMENT' | 'ADJUSTMENT'
  amount: number        // VND integer
  note?: string
  createdAt: string
  updatedAt: string
}

export interface SyncOperation {
  id?: number
  clientId: string
  syncStatus: SyncStatus
  type: string          // e.g. 'CREATE_TRANSACTION', 'UPDATE_PRODUCT'
  payload: unknown
  clientTimestamp: string
  retryCount: number
  createdAt: string
  updatedAt: string
}
