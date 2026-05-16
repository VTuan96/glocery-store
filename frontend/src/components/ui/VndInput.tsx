import { formatVND } from '../../lib/format/formatVND'

interface VndInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  placeholder?: string
  style?: React.CSSProperties
}

/**
 * VND integer input — live thousand-separator formatting, no decimals.
 * UX-DR3: 28px+ display, numeric keyboard, aria-label with currency context.
 */
export function VndInput({ value, onChange, label, placeholder, style }: VndInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    onChange(raw === '' ? 0 : parseInt(raw, 10))
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={value === 0 ? '' : value.toLocaleString('vi-VN')}
      onChange={handleChange}
      placeholder={placeholder ?? '0'}
      aria-label={label ?? 'Số tiền (VND)'}
      style={{
        padding: '10px 12px',
        fontSize: 28,
        fontWeight: 600,
        border: '1px solid #ccc',
        borderRadius: 8,
        minHeight: 56,
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}
