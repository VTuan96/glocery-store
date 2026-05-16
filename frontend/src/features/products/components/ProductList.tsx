import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { ProductForm, type ProductPayload } from './ProductForm'
import { formatVND } from '../../../lib/format/formatVND'
import type { Product } from '../../../types/global'

export function ProductList() {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const { products, isLoading, createMutation, updateMutation } = useProducts(search)

  async function handleCreate(data: ProductPayload) {
    await createMutation.mutateAsync(data)
    setCreating(false)
  }

  async function handleUpdate(data: ProductPayload) {
    if (!editing?.clientId) return
    await updateMutation.mutateAsync({ id: editing.clientId, payload: data })
    setEditing(null)
  }

  if (creating) return <ProductForm onSave={handleCreate} onCancel={() => setCreating(false)} />
  if (editing) return <ProductForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Sản phẩm</h2>
        <button onClick={() => setCreating(true)} style={styles.addBtn}>+ Thêm sản phẩm</button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm sản phẩm..." style={styles.search} aria-label="Tìm sản phẩm" />

      {isLoading && <div>Đang tải...</div>}

      <ul style={styles.list}>
        {products.map((p) => (
          <li key={p.clientId} style={styles.item} onClick={() => setEditing(p)}>
            <div>
              <div style={styles.productName}>{p.name}</div>
              <div style={styles.productMeta}>
                {p.type === 'NORMAL' ? 'Thường' : p.type === 'WEIGHT' ? 'Cân' : 'Tách lẻ'}
                {p.barcodes && p.barcodes.length > 0 && ` · ${p.barcodes.length} mã vạch`}
              </div>
            </div>
            <div style={styles.price}>{formatVND(p.defaultPrice)}</div>
          </li>
        ))}
        {!isLoading && products.length === 0 && (
          <li style={styles.empty}>Không tìm thấy sản phẩm nào</li>
        )}
      </ul>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  addBtn: { padding: '10px 20px', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', minHeight: 48 },
  search: { width: '100%', padding: '10px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 8, marginBottom: 16, boxSizing: 'border-box', minHeight: 48 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #eee', cursor: 'pointer' },
  productName: { fontSize: 16, fontWeight: 600 },
  productMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  price: { fontSize: 18, fontWeight: 700, color: '#00695C' },
  empty: { color: '#888', padding: '24px 0', textAlign: 'center' },
}
