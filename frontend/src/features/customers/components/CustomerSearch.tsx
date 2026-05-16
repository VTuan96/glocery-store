import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { useCustomers } from '../hooks/useCustomers'
import { DebtBadge } from '../../../components/ui/DebtBadge'
import type { CustomerData } from '../hooks/useCustomers'

interface CustomerSearchProps {
  open: boolean
  onSelect: (customer: CustomerData) => void
  onCancel: () => void
}

export function CustomerSearch({ open, onSelect, onCancel }: CustomerSearchProps) {
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [creating, setCreating] = useState(false)
  const { customers, createMutation } = useCustomers(search)

  async function handleCreate() {
    if (!newName.trim()) return
    const customer = await createMutation.mutateAsync({ name: newName.trim(), phone: newPhone || undefined })
    onSelect(customer)
  }

  return (
    <Drawer anchor="bottom" open={open} onClose={onCancel}>
      <div style={styles.container}>
        <h3 style={styles.title}>Chọn khách hàng</h3>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setCreating(false) }}
          style={styles.input} placeholder="Tìm theo tên (2+ ký tự)..." aria-label="Tìm khách hàng" />

        <ul style={styles.list}>
          {customers.map((c) => (
            <li key={c.id} onClick={() => onSelect(c)} style={styles.item}>
              <span>{c.name}</span>
              <DebtBadge balance={c.debtBalance} />
            </li>
          ))}
          {search.length >= 2 && customers.length === 0 && !creating && (
            <li style={styles.createPrompt}>
              <button onClick={() => { setCreating(true); setNewName(search) }} style={styles.createBtn}>
                Tạo khách hàng mới "{search}"?
              </button>
            </li>
          )}
        </ul>

        {creating && (
          <div style={styles.createForm}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)}
              style={styles.input} placeholder="Tên *" aria-label="Tên khách hàng" />
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
              style={styles.input} placeholder="Số điện thoại (tuỳ chọn)" aria-label="Số điện thoại" />
            <button onClick={handleCreate} disabled={createMutation.isPending} style={styles.saveBtn}>
              {createMutation.isPending ? '...' : 'Lưu và chọn'}
            </button>
          </div>
        )}

        <button onClick={onCancel} style={styles.cancelBtn}>Huỷ</button>
      </div>
    </Drawer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 24, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'Inter, sans-serif', maxHeight: '80vh', overflowY: 'auto' },
  title: { margin: 0, fontSize: 18, fontWeight: 700 },
  input: { padding: '10px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 8, minHeight: 48 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer' },
  createPrompt: { padding: '12px 0' },
  createBtn: { padding: '10px 16px', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, minHeight: 48 },
  createForm: { display: 'flex', flexDirection: 'column', gap: 8 },
  saveBtn: { padding: '12px 0', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
  cancelBtn: { padding: '12px 0', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
}
