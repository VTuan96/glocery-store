import { useEffect, useState } from 'react'
import { formatVND } from '../../lib/format/formatVND'
import type { CartItem } from '../../types/global'

interface RecoveryBannerProps {
  items: CartItem[]
  total: number
}

/**
 * UX-DR9: Green banner shown after cart auto-restore.
 * Auto-dismisses after 8 seconds or on user tap.
 */
export function RecoveryBanner({ items, total }: RecoveryBannerProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible || items.length === 0) return null

  return (
    <div
      onClick={() => setVisible(false)}
      style={styles.banner}
      role="status"
      aria-label="Giỏ hàng đã được khôi phục"
    >
      <span style={{ fontSize: 22 }}>✅</span>
      <div>
        <div style={styles.bannerTitle}>Giỏ hàng đã được khôi phục</div>
        <div style={styles.bannerSub}>{items.length} sản phẩm · {formatVND(total)} — tiếp tục thanh toán</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    background: '#E8F5E9',
    borderBottom: '2px solid #A5D6A7',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },
  bannerTitle: { fontSize: 15, fontWeight: 700, color: '#2E7D32' },
  bannerSub: { fontSize: 13, color: '#2E7D32' },
}
