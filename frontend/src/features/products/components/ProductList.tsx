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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  // ensure current page is valid when products or pageSize change
  if (page > totalPages) setPage(totalPages)
  const startIndex = (page - 1) * pageSize
  const pagedProducts = products.slice(startIndex, startIndex + pageSize)

  async function handleCreate(data: ProductPayload, file?: File) {
    await createMutation.mutateAsync({ payload: data, file })
    setCreating(false)
  }

  async function handleUpdate(data: ProductPayload, file?: File) {
    if (!editing?.clientId) return
    await updateMutation.mutateAsync({ id: editing.clientId, payload: data, file })
    setEditing(null)
  }

  if (creating) return <ProductForm onSave={handleCreate} onCancel={() => setCreating(false)} />
  if (editing) return <ProductForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Sản phẩm</h2>
          <p style={styles.subtitle}>Quản lý sản phẩm, ảnh và thông tin hiển thị.</p>
        </div>
        <button onClick={() => setCreating(true)} style={styles.addBtn}>+ Thêm sản phẩm</button>
      </div>

      <div style={styles.toolbar}>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..." style={styles.search} aria-label="Tìm sản phẩm" />
      </div>

      {isLoading && <div style={styles.status}>Đang tải...</div>}

      <div style={styles.grid}>
        {pagedProducts.map((p) => (
          <button key={p.clientId} type="button" style={styles.card} onClick={() => setEditing(p)}>
            <div style={styles.cardBody}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} style={styles.cardImage} />
              ) : (
                <div style={styles.cardPlaceholder}>Chưa có ảnh</div>
              )}
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{p.name}</div>
                <div style={styles.cardMeta}>
                  {p.type === 'NORMAL' ? 'Thường' : p.type === 'WEIGHT' ? 'Cân' : 'Tách lẻ'}
                  {p.barcodes && p.barcodes.length > 0 && ` · ${p.barcodes.length} mã vạch`}
                </div>
              </div>
            </div>
            <div style={styles.cardFooter}>
              <div style={styles.cardPrice}>{formatVND(p.defaultPrice)}</div>
              <div style={styles.cardBadge}>{p.type === 'NORMAL' ? 'Thường' : p.type === 'WEIGHT' ? 'Cân' : 'Tách lẻ'}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination controls - large buttons for easier use by elderly users */}
      {products.length > pageSize && (
        <div style={styles.pageControls} aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage((s) => Math.max(1, s - 1))}
            disabled={page === 1}
            style={{ ...styles.pageButton, opacity: page === 1 ? 0.5 : 1 }}
            aria-label="Trang trước"
          >
            ← Trước
          </button>

          <div style={styles.pageInfo} aria-live="polite">Trang {page} / {totalPages}</div>

          <button
            type="button"
            onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
            disabled={page === totalPages}
            style={{ ...styles.pageButton, opacity: page === totalPages ? 0.5 : 1 }}
            aria-label="Trang sau"
          >
            Sau →
          </button>

          <label style={styles.pageSizeLabel}>
            Hiển thị
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1) }}
              style={styles.pageSizeSelect}
              aria-label="Số mục trên trang"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            mục
          </label>
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div style={styles.empty}>Không tìm thấy sản phẩm nào</div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  subtitle: { margin: '8px 0 0', color: '#556069', fontSize: 14 },
  toolbar: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 24 },
  search: { flex: 1, minWidth: 260, padding: '12px 14px', fontSize: 16, border: '1px solid #D5DDE0', borderRadius: 12, boxSizing: 'border-box', background: '#fff' },
  addBtn: { padding: '12px 24px', background: '#00695C', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, cursor: 'pointer', minHeight: 48, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' },
  status: { color: '#556069', fontSize: 15, marginBottom: 16 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 20,
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: 12,
    paddingBottom: 28,
  },
  card: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', border: '1px solid #E7ECF0', borderRadius: 20, background: '#fff', padding: 18, cursor: 'pointer', textAlign: 'left', transition: 'transform 0.2s ease, box-shadow 0.2s ease', minHeight: 170, width: '100%' },
  cardBody: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 },
  cardImage: { width: 80, height: 80, borderRadius: 16, objectFit: 'cover', background: '#F7F9FA' },
  cardPlaceholder: { width: 80, height: 80, borderRadius: 16, background: '#F1F3F5', color: '#7B8A95', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 10 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
  cardMeta: { color: '#6D7880', fontSize: 13, lineHeight: 1.5 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  cardPrice: { fontSize: 18, fontWeight: 700, color: '#00695C' },
  cardBadge: { padding: '6px 12px', borderRadius: 999, background: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' },
  empty: { color: '#7B8A95', padding: '40px 0', textAlign: 'center', fontSize: 16 },
  pageControls: { display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12, padding: '12px 8px' },
  pageButton: { padding: '12px 20px', borderRadius: 12, border: 'none', background: '#00695C', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' },
  pageInfo: { fontSize: 18, color: '#27493F', fontWeight: 700, minWidth: 140, textAlign: 'center' },
  pageSizeLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#27493F' },
  pageSizeSelect: { marginLeft: 6, padding: '8px 10px', fontSize: 16, borderRadius: 8 },
}
