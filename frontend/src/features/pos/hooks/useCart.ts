import { useEffect } from 'react'
import { db } from '../../../lib/db'
import { useCartStore } from '../../../store/cartStore'
import { resolvePricing } from '../../../lib/pricing/resolvePricing'
import type { CartItem, Product } from '../../../types/global'

/**
 * Cart hook — Dexie is source of truth. Every mutation writes to db.cart first.
 * Architecture rule: never update Zustand without writing Dexie first.
 */
export function useCart() {
  const { items, setItems } = useCartStore()

  // Sync Dexie → Zustand on mount
  useEffect(() => {
    db.cart.toArray().then(setItems)
  }, [setItems])

  async function addItem(product: Product, quantity: number, overridePrice?: number) {
    const unitPrice = overridePrice ?? resolvePricing(product, quantity)
    const existing = items.find((i) => i.productId === product.clientId && !i.priceOverridden)

    if (existing && !overridePrice) {
      const newQty = existing.quantity + quantity
      const newUnitPrice = resolvePricing(product, newQty)
      const updated: CartItem = {
        ...existing,
        quantity: newQty,
        unitPrice: newUnitPrice,
        totalPrice: newUnitPrice * newQty,
        updatedAt: new Date().toISOString(),
      }
      await db.cart.put(updated)
    } else {
      const item: CartItem = {
        clientId: crypto.randomUUID(),
        syncStatus: 'pending',
        productId: product.clientId,
        productServerId: product.serverId,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        priceOverridden: !!overridePrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await db.cart.add(item)
    }
    const updated = await db.cart.toArray()
    setItems(updated)
  }

  async function updateQuantity(clientId: string, quantity: number) {
    if (quantity <= 0) {
      await db.cart.where('clientId').equals(clientId).delete()
    } else {
      const item = items.find((i) => i.clientId === clientId)
      if (!item) return
      await db.cart.where('clientId').equals(clientId).modify({
        quantity,
        totalPrice: item.unitPrice * quantity,
        updatedAt: new Date().toISOString(),
      })
    }
    setItems(await db.cart.toArray())
  }

  async function removeItem(clientId: string) {
    await db.cart.where('clientId').equals(clientId).delete()
    setItems(await db.cart.toArray())
  }

  async function clearCart() {
    await db.cart.clear()
    setItems([])
  }

  async function overridePrice(clientId: string, newPrice: number) {
    const item = items.find((i) => i.clientId === clientId)
    if (!item) return
    await db.cart.where('clientId').equals(clientId).modify({
      unitPrice: newPrice,
      totalPrice: newPrice * item.quantity,
      priceOverridden: true,
      updatedAt: new Date().toISOString(),
    })
    setItems(await db.cart.toArray())
  }

  const total = items.reduce((sum, i) => sum + i.totalPrice, 0)

  return { items, total, addItem, updateQuantity, removeItem, clearCart, overridePrice }
}
