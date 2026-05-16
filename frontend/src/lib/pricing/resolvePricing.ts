import type { Product } from '../../types/global'

/**
 * Resolve the unit price for a product at a given quantity.
 * This is the ONLY place prices are calculated — never compute inline.
 *
 * Applies the highest-threshold tier whose minQuantity <= quantity.
 * Falls back to product.defaultPrice if no tier matches.
 *
 * @example resolvePricing(product, 6) → tier price if 6 >= tier.minQuantity
 */
export function resolvePricing(product: Product, quantity: number): number {
  const tiers = product.pricingTiers
  if (!tiers || tiers.length === 0) {
    return Math.max(product.defaultPrice, 0) // Ensure never negative
  }

  // Sort descending by minQuantity, find first tier quantity qualifies for
  const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity)
  const matched = sorted.find((tier) => quantity >= tier.minQuantity)

  const result = matched ? matched.unitPrice : product.defaultPrice
  return Math.max(result, 0) // Ensure never negative
}
