import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import { useOverrideToken } from '../hooks/useOverrideToken'

const MAX_PIN_LENGTH = 4
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✓']

interface OwnerPinModalProps {
  open: boolean
  onSuccess: (token: string) => void
  onCancel: () => void
}

export function OwnerPinModal({ open, onSuccess, onCancel }: OwnerPinModalProps) {
  const [pin, setPin] = useState('')
  const { requestToken, isLoading, error } = useOverrideToken()

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
    const token = await requestToken(pin)
    if (token) {
      setPin('')
      onSuccess(token)
    }
  }

  function handleCancel() {
    setPin('')
    onCancel()
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        Nhập PIN chủ cửa hàng
      </DialogTitle>
      <DialogContent>
        <div style={styles.container}>
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

          {/* Cancel */}
          <button onClick={handleCancel} style={styles.cancelBtn} disabled={isLoading}>
            Huỷ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '8px 0 16px',
    fontFamily: 'Inter, sans-serif',
  },
  dotsRow: { display: 'flex', gap: 12, fontSize: 28, letterSpacing: 4 },
  dot: { display: 'inline-block', width: 24, textAlign: 'center' },
  error: { color: '#C62828', minHeight: 24, fontSize: 15 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    width: '100%',
    maxWidth: 280,
  },
  key: {
    minHeight: 64,
    fontSize: 22,
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  cancelBtn: {
    marginTop: 4,
    padding: '10px 32px',
    background: 'transparent',
    border: '1px solid #ccc',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
    minHeight: 48,
  },
}
