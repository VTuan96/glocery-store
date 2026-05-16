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
      <div style={styles.name}>{product.name}</div>
      <div style={styles.price}>{product.type === 'WEIGHT' ? 'Giá theo cân' : `${product.defaultPrice?.toLocaleString('vi-VN') ?? '0'} đ`}</div>
      <div style={styles.meta}></div>
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: '100%',
    minHeight: 100,
    border: '1px solid #E0E0E0',
    borderRadius: 12,
    padding: 14,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#1A1A1A',
  },
  name: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 700,
    color: '#00695C',
  },
  meta: {
    marginTop: 10,
    fontSize: 13,
    color: '#757575',
  },
}
