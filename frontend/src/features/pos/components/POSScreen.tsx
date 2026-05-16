import { useEffect, useState } from 'react'
import { useCart } from '../hooks/useCart'
import { useCheckout } from '../hooks/useCheckout'
import { useBarcode } from '../hooks/useBarcode'
import { useProducts } from '../../products/hooks/useProducts'
import { CartItemRow } from './CartItemRow'
import { CheckoutConfirmSheet } from './CheckoutConfirmSheet'
import { WeightInputSheet } from './WeightInputSheet'
import { QuickProductSheet } from './QuickProductSheet'
import { OwnerPinModal } from '../../auth/components/OwnerPinModal'
import { CustomerSearch } from '../../customers/components/CustomerSearch'
import { ProductTile } from './ProductTile'
import { VndInput } from '../../../components/ui/VndInput'
import { formatVND } from '../../../lib/format/formatVND'
import { useAuthStore } from '../../../store/authStore'
import type { CustomerData } from '../../customers/hooks/useCustomers'
import type { Product } from '../../../types/global'

export function POSScreen() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutType, setCheckoutType] = useState<'CASH' | 'DEBT'>('CASH')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [weightProduct, setWeightProduct] = useState<Product | null>(null)
  const [quickCreateName, setQuickCreateName] = useState<string | null>(null)
  const [priceOverrideItem, setPriceOverrideItem] = useState<string | null>(null)
  const [overrideValue, setOverrideValue] = useState(0)
  const [showOwnerPin, setShowOwnerPin] = useState(false)
  const [pendingOverrideItemId, setPendingOverrideItemId] = useState<string | null>(null)
  const [overrideToken, setOverrideToken] = useState<string | undefined>()

  const storeId = useAuthStore((s) => s.storeId)
  const role = useAuthStore((s) => s.role)
  const { items, total, addItem, updateQuantity, removeItem, clearCart, overridePrice } = useCart()
  const { checkout, isLoading: checkingOut } = useCheckout()
  const { scanning, notFound, videoRef, startScan, stopScan } = useBarcode(
    (product, qty) => handleAddProduct(product, qty)
  )
  const { products, isLoading: loadingProducts } = useProducts(debouncedSearch)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  function handleAddProduct(product: Product, qty = 1) {
    if (product.type === 'WEIGHT') {
      setWeightProduct(product)
    } else {
      addItem(product, qty)
    }
  }

  function handlePriceClick(itemId: string) {
    const item = items.find((i) => i.clientId === itemId)
    if (!item) return
    setOverrideValue(item.unitPrice)
    if (role === 'OWNER') {
      setPriceOverrideItem(itemId)
    } else {
      setPendingOverrideItemId(itemId)
      setShowOwnerPin(true)
    }
  }

  function handleOwnerPinSuccess(token: string) {
    setOverrideToken(token)
    setShowOwnerPin(false)
    if (pendingOverrideItemId) setPriceOverrideItem(pendingOverrideItemId)
  }

  async function applyPriceOverride() {
    if (!priceOverrideItem || overrideValue <= 0) return
    await overridePrice(priceOverrideItem, overrideValue, overrideToken)
    setPriceOverrideItem(null)
    setOverrideToken(undefined)
  }

  function handleCheckoutPress() {
    if (checkoutType === 'DEBT' && !selectedCustomer) {
      setShowCustomerSearch(true)
    } else {
      setShowCheckout(true)
    }
  }

  async function handleCheckoutConfirm() {
    const result = await checkout(items, checkoutType, selectedCustomer?.id, overrideToken)
    if (result) {
      await clearCart()
      setShowCheckout(false)
      setOverrideToken(undefined)
      setSelectedCustomer(null)
      setCheckoutType('CASH')
    }
  }

  const isTablet = window.innerWidth >= 768

  return (
    <div style={{ ...styles.screen, flexDirection: isTablet ? 'row' : 'column' }}>
      {/* Left: Product area */}
      <div style={{ ...styles.productArea, width: isTablet ? '55%' : '100%' }}>
        <div style={styles.searchRow}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm (2+ ký tự)..."
            style={styles.searchInput} autoFocus aria-label="Tìm sản phẩm"
          />
          <button onClick={scanning ? stopScan : startScan} style={styles.scanBtn}
            aria-label="Quét mã vạch">
            {scanning ? '⏹' : '📷'}
          </button>
        </div>

        {scanning && <video ref={videoRef} style={styles.video} autoPlay muted playsInline />}

        {notFound && (
          <div style={styles.notFoundPrompt}>
            <span style={{ fontWeight: 700, color: '#F57C00' }}>⚠️ Không tìm thấy mã vạch: "{notFound}"</span>
            {role === 'OWNER' && (
              <button onClick={() => setQuickCreateName(notFound)} style={styles.createPromptBtn}>
                Tạo sản phẩm mới "{notFound}"?
              </button>
            )}
          </div>
        )}

        {loadingProducts && search.length >= 2 && <div style={styles.loading}>Đang tải sản phẩm...</div>}

        {products.length > 0 ? (
          <ul style={styles.productGrid}>
            {products.map((p) => (
              <li key={p.clientId} style={styles.productTileWrapper}>
                <ProductTile product={p} onClick={() => handleAddProduct(p)} />
              </li>
            ))}
          </ul>
        ) : search.length >= 2 ? (
          <li style={styles.emptySearch}>
            <span>Không tìm thấy sản phẩm</span>
            {role === 'OWNER' && (
              <button onClick={() => setQuickCreateName(search)} style={styles.createPromptBtn}>
                Tạo sản phẩm mới "{search}"?
              </button>
            )}
          </li>
        ) : (
          <div style={styles.emptyHint}>Quét hoặc tìm sản phẩm để bắt đầu</div>
        )}

        {!loadingProducts && search.length === 0 && products.length === 0 && (
          <div style={styles.emptyHint}>Chưa có sản phẩm thường xuyên. Hãy thêm hoặc đồng bộ sản phẩm.</div>
        )}
      </div>

      {!isTablet && items.length > 0 && (
        <div style={styles.mobileSummary}>
          <div style={styles.mobileTotal}>
            <span>Tổng</span>
            <strong>{formatVND(total)}</strong>
          </div>
          <button
            onClick={handleCheckoutPress}
            disabled={items.length === 0}
            style={styles.mobileCheckoutBtn}
            aria-label="Thanh toán"
          >
            {checkoutType === 'DEBT' && !selectedCustomer ? 'Chọn khách hàng' : 'Thanh toán →'}
          </button>
        </div>
      )}

      {/* Right: Cart panel */}
      <div style={{ ...styles.cartPanel, width: isTablet ? '45%' : '100%' }}>
        <h3 style={styles.cartTitle}>GIỎ HÀNG ({items.length} món)</h3>

        {/* Payment type toggle */}
        <div style={styles.typeRow}>
          <button
            onClick={() => { setCheckoutType('CASH'); setSelectedCustomer(null) }}
            style={{ ...styles.typeBtn, background: checkoutType === 'CASH' ? '#00695C' : '#e0e0e0',
              color: checkoutType === 'CASH' ? '#fff' : '#333' }}>
            Tiền mặt
          </button>
          <button
            onClick={() => setCheckoutType('DEBT')}
            style={{ ...styles.typeBtn, background: checkoutType === 'DEBT' ? '#F57C00' : '#e0e0e0',
              color: checkoutType === 'DEBT' ? '#fff' : '#333' }}>
            Ghi nợ
          </button>
        </div>

        {checkoutType === 'DEBT' && (
          <button onClick={() => setShowCustomerSearch(true)} style={styles.customerBtn}>
            {selectedCustomer ? `👤 ${selectedCustomer.name}` : '+ Chọn khách hàng'}
          </button>
        )}

        {items.length === 0 && <div style={styles.emptyHint}>Chưa có sản phẩm nào</div>}

        {priceOverrideItem && (
          <div style={styles.overrideRow}>
            <VndInput value={overrideValue} onChange={setOverrideValue} label="Giá mới" style={{ fontSize: 18 }} />
            <button onClick={applyPriceOverride} style={styles.applyBtn}>Áp dụng</button>
            <button onClick={() => setPriceOverrideItem(null)} style={styles.cancelSmallBtn}>Huỷ</button>
          </div>
        )}

        <ul style={styles.cartList}>
          {items.map((item) => (
            <CartItemRow key={item.clientId} item={item}
              onIncrement={() => updateQuantity(item.clientId!, item.quantity + 1)}
              onDecrement={() => updateQuantity(item.clientId!, item.quantity - 1)}
              onRemove={() => removeItem(item.clientId!)}
              onPriceClick={() => handlePriceClick(item.clientId!)}
            />
          ))}
        </ul>

        <div style={styles.cartFooter}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Tổng cộng</span>
            <span style={styles.totalAmount}>{formatVND(total)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={clearCart}
              disabled={items.length === 0}
              style={{ flex: 1, height: 48, background: 'transparent', border: '2px solid #00695C', color: '#00695C', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: items.length === 0 ? 0.5 : 1 }}
            >
              Xoá giỏ
            </button>
            <button
              onClick={handleCheckoutPress}
              disabled={items.length === 0}
              style={{ ...styles.checkoutBtn, flex: 2,
                background: checkoutType === 'DEBT' ? '#F57C00' : '#00695C',
                opacity: items.length === 0 ? 0.5 : 1 }}
              aria-label="Thanh toán"
            >
              {checkoutType === 'DEBT' && !selectedCustomer ? 'Chọn khách hàng' : 'Thanh toán →'}
            </button>
          </div>
        </div>
      </div>

      <CheckoutConfirmSheet
        open={showCheckout} items={items} total={total} type={checkoutType}
        customerName={selectedCustomer?.name}
        newDebtBalance={checkoutType === 'DEBT' && selectedCustomer
          ? selectedCustomer.debtBalance + total : undefined}
        onConfirm={handleCheckoutConfirm} onCancel={() => setShowCheckout(false)}
        isLoading={checkingOut}
      />
      <WeightInputSheet
        open={!!weightProduct} product={weightProduct}
        onConfirm={(qty) => { if (weightProduct) { addItem(weightProduct, qty); setWeightProduct(null) } }}
        onCancel={() => setWeightProduct(null)}
      />
      <QuickProductSheet
        open={quickCreateName !== null} initialName={quickCreateName ?? ''}
        onSaved={(product) => { handleAddProduct(product); setQuickCreateName(null) }}
        onCancel={() => setQuickCreateName(null)}
      />
      <OwnerPinModal
        open={showOwnerPin}
        onSuccess={handleOwnerPinSuccess}
        onCancel={() => { setShowOwnerPin(false); setPendingOverrideItemId(null) }}
      />
      <CustomerSearch
        open={showCustomerSearch}
        onSelect={(customer) => { setSelectedCustomer(customer); setShowCustomerSearch(false); setShowCheckout(true) }}
        onCancel={() => setShowCustomerSearch(false)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: { display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', overflow: 'hidden' },
  productArea: { display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRight: '1px solid #E0E0E0' },
  searchRow: { display: 'flex', gap: 8, padding: '12px 16px', background: '#fff', borderBottom: '1px solid #E0E0E0' },
  searchInput: { flex: 1, height: 48, border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '0 16px', fontSize: 16, outline: 'none' },
  scanBtn: { width: 48, height: 48, background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', maxHeight: 200, borderRadius: 8, margin: '0 16px 8px' },
  notFoundPrompt: { display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', background: '#FFF3E0', borderBottom: '2px solid #FFB74D' },
  productGrid: { listStyle: 'none', padding: '12px', margin: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: 10 },
  productTileWrapper: { listStyle: 'none' },
  loading: { padding: '16px', color: '#555' },
  productTile: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 10, padding: '14px 10px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 },
  tileName: { fontSize: 15, fontWeight: 600, marginBottom: 6 },
  tilePrice: { fontSize: 16, color: '#00695C', fontWeight: 700 },
  emptySearch: { gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 8, padding: 16, color: '#888' },
  emptyHint: { color: '#aaa', textAlign: 'center', padding: 24, fontSize: 15 },
  createPromptBtn: { padding: '8px 12px', background: '#00695C', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, minHeight: 48 },
  cartPanel: { display: 'flex', flexDirection: 'column', background: '#fff' },
  cartTitle: { margin: 0, padding: '12px 16px', fontSize: 15, fontWeight: 700, color: '#616161', borderBottom: '1px solid #E0E0E0', textTransform: 'uppercase' as const },
  typeRow: { display: 'flex', gap: 8, padding: '8px 16px' },
  typeBtn: { flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', minHeight: 48 },
  customerBtn: { margin: '0 16px 8px', padding: '10px 16px', background: '#fff3e0', border: '1px solid #F57C00', borderRadius: 8, cursor: 'pointer', fontSize: 15, minHeight: 48, textAlign: 'left' as const },
  overrideRow: { display: 'flex', gap: 8, alignItems: 'center', padding: '0 16px 8px' },
  applyBtn: { padding: '8px 16px', background: '#00695C', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 48 },
  cancelSmallBtn: { padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', minHeight: 48 },
  cartList: { flex: 1, listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto' as const },
  cartFooter: { borderTop: '2px solid #E0E0E0', padding: '16px 20px', background: '#fff' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 16, color: '#616161' },
  totalAmount: { fontSize: 32, fontWeight: 700, color: '#1A1A1A' },
  checkoutBtn: { width: '100%', height: 64, color: '#fff', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer' },
  mobileSummary: { position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 12, background: '#fff', borderTop: '1px solid #E0E0E0' },
  mobileTotal: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: '#333' },
  mobileCheckoutBtn: { flex: 1, padding: '12px 16px', background: '#00695C', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 700, minHeight: 48 },
}
