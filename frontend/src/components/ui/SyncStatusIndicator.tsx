import { useEffect, useState } from 'react'
import { useNetworkStore } from '../../store/networkStore'
import { getPendingCount, flushSyncQueue } from '../../lib/sync/syncEngine'

/**
 * UX-DR7: synced (green), pending (amber), offline (amber).
 * Never red. Persistent in top bar.
 */
export function SyncStatusIndicator() {
  const isOnline = useNetworkStore((s) => s.isOnline)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const check = async () => {
      const count = await getPendingCount()
      setPendingCount(count)
      if (isOnline && count > 0) {
        await flushSyncQueue()
        setPendingCount(await getPendingCount())
      }
    }
    check()
    const interval = setInterval(check, 3000)
    return () => clearInterval(interval)
  }, [isOnline])

  if (!isOnline) {
    return <span style={{ ...styles.chip, background: 'rgba(245,124,0,.5)' }}>📴 Ngoại tuyến</span>
  }
  if (pendingCount > 0) {
    return <span style={{ ...styles.chip, background: 'rgba(245,124,0,.5)' }}>⏳ Đang đồng bộ</span>
  }
  return <span style={{ ...styles.chip, background: 'rgba(46,125,50,.5)' }}>✓ Đã đồng bộ</span>
}

const styles: Record<string, React.CSSProperties> = {
  chip: { color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'inline-block' },
}
