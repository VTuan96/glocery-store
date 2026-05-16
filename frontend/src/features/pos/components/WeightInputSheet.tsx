import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { resolvePricing } from '../../../lib/pricing/resolvePricing'
import { formatVND } from '../../../lib/format/formatVND'
import type { Product } from '../../../types/global'

interface WeightInputSheetProps {
  open: boolean
  product: Product | null
  onConfirm: (quantity: number) => void
  onCancel: () => void
}

export function WeightInputSheet({ open, product, onConfirm, onCancel }: WeightInputSheetProps) {
  const [qty, setQty] = useState('')

  const quantity = parseFloat(qty) || 0
  const price = product ? resolvePricing(product, quantity) : 0
  const total = price * quantity

  function handleConfirm() {
    if (quantity > 0) { onConfirm(quantity); setQty('') }
  }

  return (
    <Drawer anchor="bottom" open={open} onClose={onCancel}>
      <div style={styles.container}>
        <h3 style={styles.title}>{product?.name ?? ''} — Nhập số lượng</h3>
        <input
          type="number" min="0" step="0.1"
          value={qty} onChange={(e) => setQty(e.target.value)}
          style={styles.input} autoFocus
          aria-label="Số lượng"
          placeholder="0"
        />
        {quantity > 0 && (
          <div style={styles.preview}>
            {formatVND(price)} × {quantity} = <strong>{formatVND(total)}</strong>
          </div>
        )}
        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.cancelBtn}>Huỷ</button>
          <button onClick={handleConfirm} disabled={quantity <= 0} style={styles.confirmBtn}>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </Drawer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, sans-serif' },
  title: { margin: 0, fontSize: 18, fontWeight: 700 },
  input: { fontSize: 36, fontWeight: 700, padding: '12px 16px', border: '2px solid #00695C', borderRadius: 8, textAlign: 'center', minHeight: 64 },
  preview: { fontSize: 16, color: '#555', textAlign: 'center' },
  actions: { display: 'flex', gap: 8 },
  cancelBtn: { flex: 1, padding: '14px 0', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
  confirmBtn: { flex: 2, padding: '14px 0', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 64 },
}
