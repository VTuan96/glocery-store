import { GroceryStoreDB } from './schema'

// Singleton db instance — import this everywhere, never instantiate directly
export const db = new GroceryStoreDB()
