import Dexie, { type EntityTable } from 'dexie'
import type {
  Product,
  Customer,
  CartItem,
  Transaction,
  DebtRecord,
  SyncOperation,
} from '../../types/global'

class GroceryStoreDB extends Dexie {
  products!: EntityTable<Product, 'id'>
  customers!: EntityTable<Customer, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  debtRecords!: EntityTable<DebtRecord, 'id'>
  cart!: EntityTable<CartItem, 'id'>
  syncQueue!: EntityTable<SyncOperation, 'id'>

  constructor() {
    super('GroceryStoreDB')

    this.version(1).stores({
      // ++id = auto-increment local PK; clientId indexed for sync lookups
      products:     '++id, clientId, syncStatus, storeId, name, *barcodes',
      customers:    '++id, clientId, syncStatus, storeId, name',
      transactions: '++id, clientId, syncStatus, storeId, customerId, type',
      debtRecords:  '++id, clientId, syncStatus, storeId, customerId, type',
      cart:         '++id, clientId, syncStatus, productId',
      syncQueue:    '++id, clientId, syncStatus, type, retryCount',
    })
  }
}

export { GroceryStoreDB }
