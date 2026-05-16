import { useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { VndInput } from '../../../components/ui/VndInput'
import { apiClient } from '../../../lib/api/client'
import { db } from '../../../lib/db'
import { useNetworkStore } from '../../../store/networkStore'
import { useAuthStore } from '../../../store/authStore'
import { mapServerProduct } from '../../products/hooks/useProducts'
import type { Product, ProductType } from '../../../types/global'

interface QuickProductSheetProps {
  open: boolean
  initialName?: string
  onSaved: (product: Product) => void
  onCancel: () => void
}

const TYPES: { value: ProductType; label: string }[] = [
  { value: 'NORMAL', label: 'Thường' },
  { value: 'WEIGHT', label: 'Cân' },
  { value: 'SPLIT', label: 'Tách lẻ' },
]

/**
 * UX-DR10: Bottom-sheet inline product creation during active sale.
 * Cart remains visible (blurred) underneath.
 */
export function QuickProductSheet({ open, initialName = '', onSaved, onCancel }: QuickProductSheetProps) {
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(0)
  const [type, setType] = useState<ProductType>('NORMAL')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const storeId = useAuthStore((s) => s.storeId)
  const isOnline = useNetworkStore((s) => s.isOnline)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setPrice(0)
      setType('NORMAL')
      setError('')
    }
  }, [open, initialName])

  async function handleSave() {
    if (!name.trim()) { setError('Tên là bắt buộc'); return }
    if (price <= 0) { setError('Giá phải lớn hơn 0'); return }
    if (!storeId) { setError('Cửa hàng không xác định'); return }
    setSaving(true); setError('')
    try {
      let product: Product
      if (!isOnline) {
        product = {
          clientId: crypto.randomUUID(),
          syncStatus: 'pending',
          storeId,
          name: name.trim(),
          type,
          defaultPrice: price,
          barcodes: [],
          packUnits: [],
          pricingTiers: [],
          inventoryTracked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await db.products.add(product)
        await db.syncQueue.add({
          clientId: crypto.randomUUID(),
          syncStatus: 'pending',
          type: 'CREATE_PRODUCT',
          payload: product,
          clientTimestamp: new Date().toISOString(),
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } else {
        const { data } = await apiClient.post<Product>('/products', {
          name: name.trim(), type, defaultPrice: price, storeId,
          barcodes: [], packUnits: [], pricingTiers: [],
        })
        product = mapServerProduct(data as Product & { id: string }, storeId)
        await db.products.put(product)
      }
      onSaved(product)
    } catch {
      setError('Không thể lưu sản phẩm')
    } finally { setSaving(false) }
  }

  return (
    <Drawer anchor="bottom" open={open} onClose={onCancel} BackdropProps={{ sx: { backdropFilter: 'blur(2px)' } }}>
      <div style={styles.container}>
        <h3 style={styles.title}>Tạo sản phẩm mới</h3>
        <input value={name} onChange={(e) => setName(e.target.value)}
          style={styles.input} placeholder="Tên sản phẩm *" aria-label="Tên sản phẩm" />
        <VndInput value={price} onChange={setPrice} label="Giá (VND)" />
        <div style={styles.typeRow}>
          {TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => setType(t.value)}
              style={{ ...styles.typeBtn, background: type === t.value ? '#00695C' : '#e0e0e0',
                color: type === t.value ? '#fff' : '#333' }}>
              {t.label}
            </button>
          ))}
        </div>
        {error && <div style={styles.error} role="alert">{error}</div>}
        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.cancelBtn}>Huỷ</button>
          <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving ? '...' : 'Lưu và thêm vào giỏ'}
          </button>
        </div>
      </div>
    </Drawer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 24, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'Inter, sans-serif' },
  title: { margin: 0, fontSize: 18, fontWeight: 700 },
  input: { padding: '10px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 8, minHeight: 48 },
  typeRow: { display: 'flex', gap: 8 },
  typeBtn: { flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', minHeight: 48 },
  error: { color: '#C62828', fontSize: 14 },
  actions: { display: 'flex', gap: 8, marginTop: 8 },
  cancelBtn: { flex: 1, padding: '12px 0', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
  saveBtn: { flex: 2, padding: '12px 0', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 64 },
}
