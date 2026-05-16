import { formatVND } from '../../../lib/format/formatVND'
import type { CartItem } from '../../../types/global'

interface CartItemRowProps {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
  onPriceClick: () => void
}

/**
 * UX-DR4: product name + qty (−/+) | price | remove (×)
 * Bulk-price chip shown when priceOverridden.
 */
export function CartItemRow({ item, onIncrement, onDecrement, onRemove, onPriceClick }: CartItemRowProps) {
  return (
    <div style={styles.row} aria-label={`${item.productName} in cart`}>
      <div style={styles.nameCol}>
        <div style={styles.name}>{item.productName}</div>
        {item.priceOverridden && (
          <span style={styles.chip}>Giá đặc biệt</span>
        )}
      </div>

      <div style={styles.qtyCol}>
        <button onClick={onDecrement} style={styles.qtyBtn} aria-label="Giảm số lượng">−</button>
        <span style={styles.qty}>{item.quantity}</span>
        <button onClick={onIncrement} style={styles.qtyBtn} aria-label="Tăng số lượng">+</button>
      </div>

      <button onClick={onPriceClick} style={styles.price} aria-label={`Giá ${item.productName}`}>
        {formatVND(item.totalPrice)}
      </button>

      <button onClick={onRemove} style={styles.removeBtn}
        aria-label={`Remove ${item.productName} from cart`}>×</button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid #eee' },
  nameCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chip: { fontSize: 11, background: '#e0f2f1', color: '#00695C', borderRadius: 4, padding: '2px 6px', marginTop: 2, display: 'inline-block' },
  qtyCol: { display: 'flex', alignItems: 'center', gap: 4 },
  qtyBtn: { width: 32, height: 32, border: '1px solid #ccc', borderRadius: 6, background: '#f5f5f5', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: 600 },
  price: { minWidth: 80, textAlign: 'right', fontSize: 16, fontWeight: 700, color: '#00695C', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' },
  removeBtn: { width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
