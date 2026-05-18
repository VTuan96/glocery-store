import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import type { UserRole } from '../../../types/global'

const MAX_PIN_LENGTH = 4
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✓']

export function PinLogin() {
  const [pin, setPin] = useState('')
  const [role, setRole] = useState<UserRole>('OWNER')
  const { login, isLoading, error } = useLogin()
  const navigate = useNavigate()

  function handleKey(key: string) {
    if (isLoading) return
    if (key === '←') {
      setPin((p) => p.slice(0, -1))
    } else if (key === '✓') {
      if (pin.length > 0) handleSubmit()
    } else if (pin.length < MAX_PIN_LENGTH) {
      setPin((p) => p + key)
    }
  }

  async function handleSubmit() {
    await login(pin, role)
    if (!error) {
      setPin('')
      navigate('/')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.brandBadge}>🛒</div>
          <div>
            <div style={styles.brandName}>GroceryStore</div>
            <div style={styles.brandText}>POS cho cửa hàng bán lẻ</div>
          </div>
        </div>

        <div style={styles.title}>Đăng nhập bằng mã PIN</div>
        <div style={styles.description}>Chọn vai trò, nhập mã PIN và bắt đầu bán hàng.</div>

        <div style={styles.roleRow}>
          {(['OWNER', 'STAFF'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                ...styles.roleBtn,
                background: role === r ? '#00695C' : '#F1F5F4',
                color: role === r ? '#fff' : '#1F3A2D',
              }}
              aria-pressed={role === r}
            >
              {r === 'OWNER' ? 'Chủ cửa hàng' : 'Nhân viên'}
            </button>
          ))}
        </div>

        <div style={styles.dotsRow} aria-label="PIN display">
          {Array.from({ length: MAX_PIN_LENGTH }).map((_, i) => (
            <span key={i} style={styles.dot}>
              {i < pin.length ? '●' : '○'}
            </span>
          ))}
        </div>

        <div style={styles.error} role="alert">{error ?? ' '}</div>

        <div style={styles.grid}>
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              disabled={isLoading}
              style={{
                ...styles.key,
                background: key === '✓' ? '#00695C' : '#F7F9F9',
                color: key === '✓' ? '#fff' : '#1F3A2D',
              }}
              aria-label={key === '←' ? 'Backspace' : key === '✓' ? 'Confirm' : key}
            >
              {isLoading && key === '✓' ? '…' : key}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#ECF2EF',
    fontFamily: 'Inter, sans-serif',
    padding: 24,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 420,
    gap: 20,
    background: '#FFFFFF',
    borderRadius: 24,
    padding: '32px 28px',
    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.08)',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 16 },
  brandBadge: { width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F2F0', fontSize: 22 },
  brandName: { fontSize: 22, fontWeight: 800, color: '#0B3C34' },
  brandText: { fontSize: 14, color: '#5D6E6A', marginTop: 4 },
  title: { fontSize: 24, fontWeight: 800, color: '#0B3C34' },
  description: { fontSize: 14, color: '#5D6E6A', lineHeight: 1.6 },
  roleRow: { display: 'flex', gap: 12 },
  roleBtn: {
    flex: 1,
    padding: '14px 0',
    border: '1px solid #E2E9E5',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dotsRow: { display: 'flex', gap: 16, fontSize: 32, letterSpacing: 4, justifyContent: 'center' },
  dot: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 },
  error: { color: '#C62828', minHeight: 20, fontSize: 14, textAlign: 'center' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    width: '100%',
  },
  key: {
    minHeight: 64,
    fontSize: 20,
    fontWeight: 700,
    border: 'none',
    borderRadius: 16,
    cursor: 'pointer',
  },
}
