import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'

export function StaffList() {
  const { staff, isLoading, createMutation, deactivateMutation } = useUsers()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || pin.length < 4) { setError('Tên và PIN (≥4 chữ số) là bắt buộc'); return }
    try {
      await createMutation.mutateAsync({ name, pin })
      setName(''); setPin('')
    } catch {
      setError('Không thể tạo tài khoản')
    }
  }

  if (isLoading) return <div>Đang tải...</div>

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Quản lý nhân viên</h2>

      {/* Create form */}
      <form onSubmit={handleCreate} style={styles.form}>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Tên nhân viên" style={styles.input}
          aria-label="Tên nhân viên"
        />
        <input
          value={pin} onChange={(e) => setPin(e.target.value)}
          placeholder="PIN (4-8 chữ số)" type="password" maxLength={8}
          style={styles.input} aria-label="PIN"
        />
        {error && <div style={styles.error} role="alert">{error}</div>}
        <button type="submit" disabled={createMutation.isPending} style={styles.btn}>
          {createMutation.isPending ? '...' : 'Thêm nhân viên'}
        </button>
      </form>

      {/* Staff list */}
      <ul style={styles.list}>
        {staff.map((u) => (
          <li key={u.id} style={styles.item}>
            <span style={{ opacity: u.active ? 1 : 0.5 }}>
              {u.name} {!u.active && '(Đã vô hiệu hoá)'}
            </span>
            {u.active && (
              <button
                onClick={() => deactivateMutation.mutate(u.id)}
                disabled={deactivateMutation.isPending}
                style={styles.deactivateBtn}
                aria-label={`Vô hiệu hoá ${u.name}`}
              >
                Vô hiệu hoá
              </button>
            )}
          </li>
        ))}
        {staff.length === 0 && <li style={{ color: '#888' }}>Chưa có nhân viên nào</li>}
      </ul>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 480, margin: '0 auto', padding: 24, fontFamily: 'Inter, sans-serif' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 },
  input: { padding: '10px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 8, minHeight: 48 },
  error: { color: '#C62828', fontSize: 14 },
  btn: { padding: '12px 0', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
  deactivateBtn: { padding: '8px 16px', background: '#C62828', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 48 },
}
