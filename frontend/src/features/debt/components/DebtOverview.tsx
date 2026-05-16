import { useState } from 'react'
import { useDebtOverview, useDebtHistory, useRecordDebt } from '../hooks/useDebt'
import { useCustomer } from '../../customers/hooks/useCustomers'
import { DebtBadge } from '../../../components/ui/DebtBadge'
import { VndInput } from '../../../components/ui/VndInput'
import { formatVND } from '../../../lib/format/formatVND'

export function DebtOverview() {
  const { data: customers = [], isLoading } = useDebtOverview()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (selectedId) {
    return <CustomerDebtDetail customerId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Công nợ khách hàng</h2>
      {isLoading && <div>Đang tải...</div>}
      {!isLoading && customers.length === 0 && (
        <div style={styles.empty}>
          <span style={{ fontSize: 32 }}>✓</span>
          <div>Không có khách nào đang nợ</div>
        </div>
      )}
      <ul style={styles.list}>
        {customers.map((c) => (
          <li key={c.customerId} onClick={() => setSelectedId(c.customerId)} style={styles.item}>
            <span style={styles.name}>{c.name}</span>
            <DebtBadge balance={c.balance} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function CustomerDebtDetail({ customerId, onBack }: { customerId: string; onBack: () => void }) {
  const { data: customer } = useCustomer(customerId)
  const { data: history = [] } = useDebtHistory(customerId)
  const recordDebt = useRecordDebt()
  const [payAmount, setPayAmount] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handlePayment() {
    if (payAmount <= 0) return
    await recordDebt.mutateAsync({ customerId, type: 'PAYMENT', amount: payAmount })
    setShowPayment(false); setShowConfirm(false); setPayAmount(0)
  }

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backBtn}>← Quay lại</button>
      <h2 style={styles.title}>{customer?.name}</h2>
      <div style={styles.balanceRow}>
        <span>Tổng nợ:</span>
        <DebtBadge balance={customer?.debtBalance} />
      </div>

      {!showPayment && (
        <button onClick={() => setShowPayment(true)} style={styles.payBtn}>Thu tiền</button>
      )}

      {showPayment && !showConfirm && (
        <div style={styles.payForm}>
          <VndInput value={payAmount || (customer?.debtBalance ?? 0)}
            onChange={setPayAmount} label="Số tiền thu" />
          <button onClick={() => { setPayAmount(payAmount || (customer?.debtBalance ?? 0)); setShowConfirm(true) }}
            style={styles.payBtn}>Xác nhận thu tiền</button>
          <button onClick={() => setShowPayment(false)} style={styles.cancelBtn}>Huỷ</button>
        </div>
      )}

      {showConfirm && (
        <div style={styles.confirmBox}>
          <div>Thu: <strong>{formatVND(payAmount)}</strong></div>
          <div>Nợ còn lại: <strong>{formatVND((customer?.debtBalance ?? 0) - payAmount)}</strong></div>
          <button onClick={handlePayment} disabled={recordDebt.isPending} style={styles.payBtn}>
            {recordDebt.isPending ? '...' : 'Xác nhận'}
          </button>
          <button onClick={() => setShowConfirm(false)} style={styles.cancelBtn}>Huỷ</button>
        </div>
      )}

      <h3 style={{ marginTop: 24 }}>Lịch sử giao dịch</h3>
      <ul style={styles.list}>
        {history.map((r) => (
          <li key={r.id} style={styles.historyItem}>
            <div>
              <div style={{ fontWeight: 600 }}>
                {r.type === 'DEBT' ? 'Ghi nợ' : r.type === 'PAYMENT' ? 'Thu tiền' : 'Điều chỉnh'}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>
            <span style={{ color: r.type === 'PAYMENT' ? '#2E7D32' : '#C62828', fontWeight: 700 }}>
              {r.type === 'PAYMENT' ? '-' : '+'}{formatVND(r.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: 'Inter, sans-serif' },
  title: { fontSize: 22, fontWeight: 700, margin: '0 0 16px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#2E7D32', padding: 32 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #eee', cursor: 'pointer' },
  name: { fontSize: 16, fontWeight: 600 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#00695C', padding: '8px 0', marginBottom: 8 },
  balanceRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  payBtn: { padding: '14px 0', background: '#F57C00', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 64, width: '100%' },
  payForm: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  cancelBtn: { padding: '12px 0', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48, width: '100%' },
  confirmBox: { display: 'flex', flexDirection: 'column', gap: 8, background: '#fff8e1', borderRadius: 8, padding: 16, marginBottom: 16 },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
}
