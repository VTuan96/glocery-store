import { useRef, useState } from 'react'
import { formatVND } from '../../../lib/format/formatVND'
import type { CartItem } from '../../../types/global'

interface CartItemRowProps {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
  onPriceClick: () => void
}

export function CartItemRow({ item, onIncrement, onDecrement, onRemove, onPriceClick }: CartItemRowProps) {
  const [translateX, setTranslateX] = useState(0)
  const [swipeOpen, setSwipeOpen] = useState(false)
  const pointerStartX = useRef<number | null>(null)

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    if (target.closest('button')) return
    pointerStartX.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerStartX.current === null) return
    const deltaX = event.clientX - pointerStartX.current
    if (deltaX < 0) {
      setTranslateX(Math.max(deltaX, -96))
    }
  }

  function handlePointerUp() {
    if (translateX <= -64) {
      setTranslateX(-96)
      setSwipeOpen(true)
    } else {
      setTranslateX(0)
      setSwipeOpen(false)
    }
    pointerStartX.current = null
  }

  function handleRemove() {
    setTranslateX(0)
    setSwipeOpen(false)
    onRemove()
  }

  return (
    <div style={styles.container}>
      <div style={styles.deleteAction}>
        <button onClick={handleRemove} style={styles.swipeRemoveBtn} aria-label="Xoá mục này">
          Xoá
        </button>
      </div>
      <div
        style={{ ...styles.row, transform: `translateX(${translateX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div style={styles.nameCol}>
          <div style={styles.name}>{item.productName}</div>
          {item.priceOverridden && <span style={styles.chip}>Giá đặc biệt</span>}
        </div>

        <div style={styles.qtyCol}>
          <button onClick={onDecrement} style={styles.qtyBtn} aria-label="Giảm số lượng">−</button>
          <span style={styles.qty}>{item.quantity}</span>
          <button onClick={onIncrement} style={styles.qtyBtn} aria-label="Tăng số lượng">+</button>
        </div>

        <button onClick={onPriceClick} style={styles.price} aria-label={`Giá ${item.productName}`}>
          <div style={styles.priceLabel}>{formatVND(item.totalPrice)}</div>
          {item.priceOverridden && item.originalUnitPrice !== undefined && (
            <div style={styles.originalPrice}>{formatVND(item.originalUnitPrice * item.quantity)}</div>
          )}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { position: 'relative', overflow: 'hidden' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    transition: 'transform 0.2s ease',
    touchAction: 'pan-y',
    background: '#fff',
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 96,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#C62828',
  },
  swipeRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
  nameCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chip: { fontSize: 11, background: '#e0f2f1', color: '#00695C', borderRadius: 4, padding: '2px 6px', marginTop: 2, display: 'inline-block' },
  qtyCol: { display: 'flex', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 44, height: 40, border: '1px solid #ccc', borderRadius: 8, background: '#f5f5f5', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 32, textAlign: 'center', fontSize: 16, fontWeight: 700 },
  price: { minWidth: 90, textAlign: 'right', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  priceLabel: { fontSize: 16, fontWeight: 700, color: '#00695C' },
  originalPrice: { fontSize: 12, color: '#888', textDecoration: 'line-through' },
}
