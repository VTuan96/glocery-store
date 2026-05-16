import { describe, it, expect } from 'vitest'
import { resolvePricing } from './resolvePricing'
import type { Product } from '../../types/global'

const baseProduct: Product = {
  clientId: 'test-id',
  syncStatus: 'synced',
  storeId: 'store-1',
  name: 'Test Product',
  type: 'NORMAL',
  defaultPrice: 10000,
  inventoryTracked: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('resolvePricing', () => {
  it('returns defaultPrice when no tiers defined', () => {
    expect(resolvePricing(baseProduct, 1)).toBe(10000)
  })

  it('returns defaultPrice when tiers array is empty', () => {
    const product = { ...baseProduct, pricingTiers: [] }
    expect(resolvePricing(product, 5)).toBe(10000)
  })

  it('returns defaultPrice when quantity is below all tiers', () => {
    const product = { ...baseProduct, pricingTiers: [{ minQuantity: 6, unitPrice: 8500 }] }
    expect(resolvePricing(product, 3)).toBe(10000)
  })

  it('applies tier when quantity meets minQuantity exactly', () => {
    const product = { ...baseProduct, pricingTiers: [{ minQuantity: 6, unitPrice: 8500 }] }
    expect(resolvePricing(product, 6)).toBe(8500)
  })

  it('applies tier when quantity exceeds minQuantity', () => {
    const product = { ...baseProduct, pricingTiers: [{ minQuantity: 6, unitPrice: 8500 }] }
    expect(resolvePricing(product, 10)).toBe(8500)
  })

  it('applies highest qualifying tier with multiple tiers', () => {
    const product = {
      ...baseProduct,
      pricingTiers: [
        { minQuantity: 6, unitPrice: 8500 },
        { minQuantity: 12, unitPrice: 7000 },
      ],
    }
    expect(resolvePricing(product, 6)).toBe(8500)
    expect(resolvePricing(product, 12)).toBe(7000)
    expect(resolvePricing(product, 20)).toBe(7000)
    expect(resolvePricing(product, 1)).toBe(10000)
  })
})
