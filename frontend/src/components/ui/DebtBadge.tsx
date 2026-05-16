import { formatVND } from '../../lib/format/formatVND'

interface DebtBadgeProps {
  balance: number | undefined
}

/**
 * UX-DR6: has-debt (amber), no-debt (green "Sạch nợ"), unknown variants.
 */
export function DebtBadge({ balance }: DebtBadgeProps) {
  if (balance === undefined) {
    return <span style={{ ...styles.badge, background: '#e0e0e0', color: '#555' }}>?</span>
  }
  if (balance > 0) {
    return <span style={{ ...styles.badge, background: '#F57C00', color: '#fff' }}>{formatVND(balance)}</span>
  }
  return <span style={{ ...styles.badge, background: '#2E7D32', color: '#fff' }}>Sạch nợ</span>
}

const styles: Record<string, React.CSSProperties> = {
  badge: { padding: '4px 10px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'inline-block' },
}
