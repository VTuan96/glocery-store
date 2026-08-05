import type { Product } from '../../../types/global'

interface ProductTileProps {
  product: Product
  onClick?: () => void
}

export function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.root}
      aria-label={`Chọn sản phẩm ${product.name}`}
    >
      <div style={styles.topRow}>
        <div style={styles.name}>{product.name}</div>
        <div style={styles.typeBadge}>{product.type === 'NORMAL' ? 'Thường' : product.type === 'WEIGHT' ? 'Cân' : 'Tách lẻ'}</div>
      </div>
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} style={styles.thumb} />
      ) : (
        <div style={styles.placeholder}>Chưa có hình</div>
      )}
      <div style={styles.footerRow}>
        <div style={styles.price}>{product.type === 'WEIGHT' ? 'Giá theo cân' : `${product.defaultPrice?.toLocaleString('vi-VN') ?? '0'} đ`}</div>
        <div style={styles.actionHint}>Chạm để thêm</div>
      </div>
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: '100%',
    minHeight: 140,
    border: '1px solid #E3ECE9',
    borderRadius: 16,
    padding: 14,
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#102623',
    boxShadow: '0 8px 18px rgba(15, 95, 77, 0.05)',
    transition: 'transform 0.18s ease',
  },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 700, lineHeight: 1.3, color: '#10382F' },
  typeBadge: { padding: '4px 10px', borderRadius: 999, background: '#E8F2EE', color: '#14533F', fontSize: 12, fontWeight: 700 },
  thumb: { width: '100%', height: 88, borderRadius: 12, objectFit: 'cover', background: '#F4F6F5', marginBottom: 10 },
  placeholder: { width: '100%', height: 88, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F5', color: '#7A8E88', fontSize: 13, marginBottom: 10, padding: 10 },
  footerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  price: { fontSize: 16, fontWeight: 700, color: '#0F5F4D' },
  actionHint: { fontSize: 12, color: '#5C6E6A' },
}
