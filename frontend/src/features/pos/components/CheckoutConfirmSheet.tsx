import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import { formatVND } from '../../../lib/format/formatVND'
import type { CartItem } from '../../../types/global'

interface CheckoutConfirmSheetProps {
  open: boolean
  items: CartItem[]
  total: number
  type: 'CASH' | 'DEBT'
  customerName?: string
  newDebtBalance?: number
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

/**
 * UX-DR8: Full-screen confirmation before financial commit.
 * Cannot be dismissed by tapping outside.
 */
export function CheckoutConfirmSheet({
  open, items, total, type, customerName, newDebtBalance, onConfirm, onCancel, isLoading
}: CheckoutConfirmSheetProps) {
  return (
    <Dialog open={open} onClose={() => {}} disableEscapeKeyDown maxWidth="sm" fullWidth>
      <DialogTitle style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        {type === 'CASH' ? 'Xác nhận thanh toán tiền mặt' : 'Xác nhận ghi nợ'}
      </DialogTitle>
      <DialogContent>
        <div style={styles.container}>
          {/* Item list */}
          <ul style={styles.itemList}>
            {items.map((item) => (
              <li key={item.clientId} style={styles.itemRow}>
                <span>{item.productName} × {item.quantity}</span>
                <span>{formatVND(item.totalPrice)}</span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div style={styles.totalRow}>
            <span>Tổng cộng</span>
            <span style={styles.totalAmount}>{formatVND(total)}</span>
          </div>

          {/* Debt info */}
          {type === 'DEBT' && customerName && (
            <div style={styles.debtInfo}>
              <div>Khách hàng: <strong>{customerName}</strong></div>
              {newDebtBalance !== undefined && (
                <div>Nợ mới: <strong style={{ color: '#F57C00' }}>{formatVND(newDebtBalance)}</strong></div>
              )}
            </div>
          )}

          <div style={styles.actions}>
            <button onClick={onCancel} disabled={isLoading} style={styles.cancelBtn}>Huỷ</button>
            <button onClick={onConfirm} disabled={isLoading} style={styles.confirmBtn}>
              {isLoading ? '...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, sans-serif' },
  itemList: { listStyle: 'none', padding: 0, margin: 0 },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: 15 },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 700, fontSize: 18 },
  totalAmount: { fontSize: 28, fontWeight: 800, color: '#00695C' },
  debtInfo: { background: '#fff8e1', borderRadius: 8, padding: 12, fontSize: 15 },
  actions: { display: 'flex', gap: 8 },
  cancelBtn: { flex: 1, padding: '14px 0', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
  confirmBtn: { flex: 2, padding: '14px 0', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 64 },
}
