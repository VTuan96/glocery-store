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
        {/* Logo / Title */}
        <div style={styles.logo}>🛒 GroceryStore</div>
        <div style={styles.subtitle}>Đăng nhập bằng PIN</div>

        {/* Role selector */}
        <div style={styles.roleRow}>
          {(['OWNER', 'STAFF'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                ...styles.roleBtn,
                background: role === r ? '#00695C' : '#e0e0e0',
                color: role === r ? '#fff' : '#333',
              }}
              aria-pressed={role === r}
            >
              {r === 'OWNER' ? 'Chủ cửa hàng' : 'Nhân viên'}
            </button>
          ))}
        </div>

        {/* PIN dots */}
        <div style={styles.dotsRow} aria-label="PIN display">
          {Array.from({ length: MAX_PIN_LENGTH }).map((_, i) => (
            <span key={i} style={styles.dot}>
              {i < pin.length ? '●' : '○'}
            </span>
          ))}
        </div>

        {/* Error */}
        <div style={styles.error} role="alert">
          {error ?? ''}
        </div>

        {/* PIN pad */}
        <div style={styles.grid}>
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              disabled={isLoading}
              style={{
                ...styles.key,
                background: key === '✓' ? '#00695C' : '#f5f5f5',
                color: key === '✓' ? '#fff' : '#333',
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
    background: '#FAFAF8',
    fontFamily: 'Inter, sans-serif',
    padding: 24,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    background: '#fff',
    borderRadius: 16,
    padding: '32px 24px',
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 4px 24px rgba(0,0,0,.08)',
  },
  logo: { fontSize: 24, fontWeight: 700, color: '#00695C' },
  subtitle: { fontSize: 15, color: '#616161', marginTop: -8 },
  roleRow: { display: 'flex', gap: 8, width: '100%' },
  roleBtn: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
    minHeight: 48,
    fontWeight: 600,
  },
  dotsRow: { display: 'flex', gap: 16, fontSize: 32, letterSpacing: 4 },
  dot: { display: 'inline-block', width: 28, textAlign: 'center' },
  error: { color: '#C62828', minHeight: 20, fontSize: 14, textAlign: 'center' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    width: '100%',
  },
  key: {
    minHeight: 64,
    fontSize: 22,
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
}
