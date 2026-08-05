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
  const [voiceStatus, setVoiceStatus] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [priceOverrideItem, setPriceOverrideItem] = useState<string | null>(null)
  const [overrideValue, setOverrideValue] = useState(0)
  const [showOwnerPin, setShowOwnerPin] = useState(false)
  const [pendingOverrideItemId, setPendingOverrideItemId] = useState<string | null>(null)
  const [overrideToken, setOverrideToken] = useState<string | undefined>()

  const role = useAuthStore((s) => s.role)
  const { items, total, addItem, updateQuantity, removeItem, clearCart, overridePrice } = useCart()
  const { checkout, isLoading: checkingOut } = useCheckout()
  const { scanning, notFound, videoRef, startScan, stopScan } = useBarcode(
    (product, qty) => handleAddProduct(product, qty)
  )
  const { products, isLoading: loadingProducts } = useProducts(debouncedSearch)
  const [page, setPage] = useState(1)
  const PAGE_SIZE_OPTIONS = [5, 10, 15, 20]
  const [pageSize, setPageSize] = useState<number>(() => {
    try {
      const v = localStorage.getItem('pos_page_size')
      return v ? Number(v) : 10
    } catch {
      return 10
    }
  })

  useEffect(() => {
    setPage(1)
    try {
      localStorage.setItem('pos_page_size', String(pageSize))
    } catch {}
  }, [pageSize, debouncedSearch])

  // products to show on current page
  const totalProducts = products.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])
  const pageProducts = products.slice((page - 1) * pageSize, page * pageSize)

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

  function handleVoiceSearch() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceStatus('Trình duyệt không hỗ trợ tìm kiếm giọng nói')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'vi-VN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceStatus('Đang nghe...')
    }

    recognition.onspeechend = () => {
      recognition.stop()
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? ''
      if (transcript) {
        setSearch(transcript)
        setDebouncedSearch(transcript)
        setVoiceStatus(`Kết quả: "${transcript}"`)
      } else {
        setVoiceStatus('Không nhận diện được giọng nói')
      }
    }

    recognition.onerror = () => {
      setVoiceStatus('Lỗi giọng nói, thử lại')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const isTablet = window.innerWidth >= 768

  return (
    <div style={{ ...styles.screen, flexDirection: isTablet ? 'row' : 'column' }}>
      <div style={{ ...styles.productArea, width: isTablet ? '60%' : '100%' }}>
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.pageTitle}>Bán hàng</h2>
            <p style={styles.pageSubtitle}>Chọn sản phẩm và hoàn tất giao dịch nhanh chóng.</p>
          </div>
          <div style={styles.statsChip}>{products.length} sản phẩm</div>
        </div>

        <div style={styles.searchRow}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm (2+ ký tự)..."
            style={styles.searchInput}
            autoFocus
            aria-label="Tìm sản phẩm"
          />
          <div style={styles.searchButtons}>
            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={isListening}
              style={{ ...styles.voiceBtn, opacity: isListening ? 0.7 : 1 }}
              aria-label="Tìm bằng giọng nói"
            >
              {isListening ? '⏹' : '🎤'}
            </button>
            <button onClick={scanning ? stopScan : startScan} style={styles.scanBtn} aria-label="Quét mã vạch">
              {scanning ? '⏹' : '📷'}
            </button>
          </div>
        </div>

        {voiceStatus && <div style={styles.voiceStatus}>{voiceStatus}</div>}

        {scanning && <video ref={videoRef} style={styles.video} autoPlay muted playsInline />}

        {notFound && (
          <div style={styles.notFoundPrompt}>
            <span style={styles.notFoundText}>⚠️ Không tìm thấy mã vạch: "{notFound}"</span>
            {role === 'OWNER' && (
              <button onClick={() => setQuickCreateName(notFound)} style={styles.createPromptBtn}>
                Tạo sản phẩm mới "{notFound}"?
              </button>
            )}
          </div>
        )}

        <div style={styles.productListArea}>
          {loadingProducts && search.length >= 2 && <div style={styles.loading}>Đang tải sản phẩm...</div>}

          {products.length > 0 ? (
            <>
              <ul style={styles.productGrid}>
                {pageProducts.map((p) => (
                  <li key={p.clientId} style={styles.productTileWrapper}>
                    <ProductTile product={p} onClick={() => handleAddProduct(p)} />
                  </li>
                ))}
              </ul>

              <div style={styles.paginationRow}>
                <div style={styles.pageSizeControl}>
                  <label style={{ marginRight: 8, color: '#4F6B66' }}>Số hàng:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={styles.pageSizeSelect}
                  >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.pageControls}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>‹</button>
                  <span style={styles.pageInfo}>{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={styles.pageBtn}>›</button>
                </div>
              </div>
            </>
          ) : search.length >= 2 ? (
            <div style={styles.emptySearch}>
              <span>Không tìm thấy sản phẩm</span>
              {role === 'OWNER' && (
                <button onClick={() => setQuickCreateName(search)} style={styles.createPromptBtn}>
                  Tạo sản phẩm mới "{search}"?
                </button>
              )}
            </div>
          ) : (
            <div style={styles.emptyHint}>Quét hoặc tìm sản phẩm để bắt đầu</div>
          )}

          {!loadingProducts && search.length === 0 && products.length === 0 && (
            <div style={styles.emptyHint}>Chưa có sản phẩm thường xuyên. Hãy thêm hoặc đồng bộ sản phẩm.</div>
          )}
        </div>
      </div>

      <div style={{ ...styles.cartPanel, width: isTablet ? '40%' : '100%' }}>
        <div style={styles.cartHeader}>
          <div>
            <h3 style={styles.cartTitle}>Giỏ hàng</h3>
            <p style={styles.cartSubtitle}>{items.length} mặt hàng</p>
          </div>
          <div style={styles.cartBadge}>{formatVND(total)}</div>
        </div>

        <div style={styles.cartControls}>
          <button
            onClick={() => {
              setCheckoutType('CASH')
              setSelectedCustomer(null)
            }}
            style={{
              ...styles.typeBtn,
              background: checkoutType === 'CASH' ? '#00695C' : '#F1F5F3',
              color: checkoutType === 'CASH' ? '#fff' : '#284437',
            }}
          >
            Tiền mặt
          </button>
          <button
            onClick={() => setCheckoutType('DEBT')}
            style={{
              ...styles.typeBtn,
              background: checkoutType === 'DEBT' ? '#F57C00' : '#F1F5F3',
              color: checkoutType === 'DEBT' ? '#fff' : '#284437',
            }}
          >
            Ghi nợ
          </button>
        </div>

        {checkoutType === 'DEBT' && (
          <button onClick={() => setShowCustomerSearch(true)} style={styles.customerBtn}>
            {selectedCustomer ? `👤 ${selectedCustomer.name}` : '+ Chọn khách hàng'}
          </button>
        )}

        {priceOverrideItem && (
          <div style={styles.overrideRow}>
            <VndInput value={overrideValue} onChange={setOverrideValue} label="Giá mới" style={{ fontSize: 16 }} />
            <button onClick={applyPriceOverride} style={styles.applyBtn}>
              Áp dụng
            </button>
            <button onClick={() => setPriceOverrideItem(null)} style={styles.cancelSmallBtn}>
              Huỷ
            </button>
          </div>
        )}

        <div style={styles.cartBody}>
          {items.length === 0 ? (
            <div style={styles.emptyHint}>Chưa có sản phẩm nào trong giỏ</div>
          ) : (
            <ul style={styles.cartList}>
              {items.map((item) => (
                <CartItemRow
                  key={item.clientId}
                  item={item}
                  onIncrement={() => updateQuantity(item.clientId!, item.quantity + 1)}
                  onDecrement={() => updateQuantity(item.clientId!, item.quantity - 1)}
                  onRemove={() => removeItem(item.clientId!)}
                  onPriceClick={() => handlePriceClick(item.clientId!)}
                />
              ))}
            </ul>
          )}
        </div>

        <div style={styles.cartFooter}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Tổng cộng</span>
            <span style={styles.totalAmount}>{formatVND(total)}</span>
          </div>
          <div style={styles.footerActions}>
            <button
              onClick={clearCart}
              disabled={items.length === 0}
              style={{ ...styles.clearButton, opacity: items.length === 0 ? 0.55 : 1 }}
            >
              Xoá giỏ
            </button>
            <button
              onClick={handleCheckoutPress}
              disabled={items.length === 0}
              style={{ ...styles.checkoutBtn, opacity: items.length === 0 ? 0.55 : 1 }}
            >
              {checkoutType === 'DEBT' && !selectedCustomer ? 'Chọn khách hàng' : 'Thanh toán →'}
            </button>
          </div>
        </div>
      </div>

      <CheckoutConfirmSheet
        open={showCheckout}
        items={items}
        total={total}
        type={checkoutType}
        customerName={selectedCustomer?.name}
        newDebtBalance={checkoutType === 'DEBT' && selectedCustomer ? selectedCustomer.debtBalance + total : undefined}
        onConfirm={handleCheckoutConfirm}
        onCancel={() => setShowCheckout(false)}
        isLoading={checkingOut}
      />
      <WeightInputSheet
        open={!!weightProduct}
        product={weightProduct}
        onConfirm={(qty) => {
          if (weightProduct) {
            addItem(weightProduct, qty)
            setWeightProduct(null)
          }
        }}
        onCancel={() => setWeightProduct(null)}
      />
      <QuickProductSheet
        open={quickCreateName !== null}
        initialName={quickCreateName ?? ''}
        onSaved={(product) => {
          handleAddProduct(product)
          setQuickCreateName(null)
        }}
        onCancel={() => setQuickCreateName(null)}
      />
      <OwnerPinModal
        open={showOwnerPin}
        onSuccess={handleOwnerPinSuccess}
        onCancel={() => {
          setShowOwnerPin(false)
          setPendingOverrideItemId(null)
        }}
      />
      <CustomerSearch
        open={showCustomerSearch}
        onSelect={(customer) => {
          setSelectedCustomer(customer)
          setShowCustomerSearch(false)
          setShowCheckout(true)
        }}
        onCancel={() => setShowCustomerSearch(false)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: { display: 'flex', height: '100%', minHeight: 0, fontFamily: 'Inter, sans-serif', overflow: 'hidden', background: '#F3F7F6', gap: 24 },
  productArea: { display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0, padding: 16, background: '#F7FBFA', borderRight: '1px solid #E6ECE8', borderRadius: 24, boxShadow: '0 12px 30px rgba(15, 95, 77, 0.06)' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' },
  pageTitle: { margin: 0, fontSize: 28, fontWeight: 800, color: '#11463D' },
  pageSubtitle: { margin: '8px 0 0', fontSize: 14, color: '#556C6A' },
  statsChip: { padding: '10px 16px', borderRadius: 999, background: '#E6F2EF', color: '#145440', fontWeight: 700, fontSize: 13 },
  searchRow: { display: 'flex', gap: 12, padding: 18, borderRadius: 24, background: '#FFFFFF', border: '1px solid #E5ECE6', alignItems: 'center', boxShadow: '0 12px 30px rgba(15, 95, 77, 0.06)' },
  searchInput: { flex: 1, height: 56, borderRadius: 18, border: '1px solid #D8E3E0', padding: '0 18px', fontSize: 16, outline: 'none', background: '#FAFEFF' },
  searchButtons: { display: 'flex', gap: 12 },
  voiceBtn: { width: 56, height: 56, borderRadius: 18, border: 'none', background: '#0F5F4D', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'grid', placeItems: 'center' },
  scanBtn: { width: 56, height: 56, borderRadius: 18, border: 'none', background: '#0F5F4D', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'grid', placeItems: 'center' },
  voiceStatus: { marginTop: 10, color: '#556C6A', fontSize: 13, paddingLeft: 4 },
  video: { width: '100%', maxHeight: 220, minHeight: 180, borderRadius: 20, marginTop: 18, objectFit: 'cover' },
  notFoundPrompt: { display: 'flex', flexDirection: 'column', gap: 10, padding: 18, borderRadius: 18, background: '#FFF7ED', border: '1px solid #FFD4A6', marginTop: 16 },
  notFoundText: { margin: 0, color: '#8A4E00', fontWeight: 700 },
  productListArea: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', marginTop: 12, padding: 12, paddingBottom: 12, borderRadius: 24, background: '#FFFFFF', boxShadow: '0 10px 24px rgba(15, 95, 77, 0.06)' },
  productGrid: { flex: 1, minHeight: 0, overflowY: 'auto', listStyle: 'none', padding: 8, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, paddingBottom: 12, alignContent: 'start' },
  productTileWrapper: { listStyle: 'none' },
  paginationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px 0', gap: 12 },
  pageSizeControl: { display: 'flex', alignItems: 'center' },
  pageSizeSelect: { padding: '8px 10px', borderRadius: 8, border: '1px solid #D8E3E0', background: '#fff' },
  pageControls: { display: 'flex', alignItems: 'center', gap: 8 },
  pageBtn: { padding: '8px 12px', borderRadius: 8, border: '1px solid #D8E3E0', background: '#F7FBFA', cursor: 'pointer' },
  pageInfo: { color: '#556C6A', fontWeight: 700 },
  loading: { padding: 16, color: '#4F6B66' },
  emptySearch: { padding: 24, borderRadius: 18, background: '#FFFFFF', textAlign: 'center', color: '#677675', fontSize: 15 },
  emptyHint: { padding: 28, textAlign: 'center', color: '#677675', fontSize: 15 },
  createPromptBtn: { padding: '12px 18px', borderRadius: 999, background: '#0F5F4D', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 },
  cartPanel: { display: 'flex', width: '36%', minWidth: 280, flexDirection: 'column', minHeight: 0, maxHeight: '100%', background: '#FFFFFF', padding: 22, overflow: 'hidden', borderRadius: 24, border: '1px solid #E7ECEB', boxShadow: '0 20px 50px rgba(15, 95, 77, 0.06)' },
  cartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #E7ECEB' },
  cartTitle: { margin: 0, fontSize: 22, fontWeight: 800, color: '#11463D' },
  cartSubtitle: { margin: '8px 0 0', color: '#556C6A', fontSize: 13 },
  cartBadge: { alignSelf: 'center', padding: '10px 16px', borderRadius: 999, background: '#E8F4EE', color: '#0F5F4D', fontWeight: 700, fontSize: 13 },
  cartControls: { display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: '#F8FBFA', borderRadius: 18 },
  typeBtn: { flex: 1, borderRadius: 16, border: '1px solid transparent', padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s ease, color 0.2s ease' },
  customerBtn: { width: '100%', borderRadius: 18, border: '1px solid #D8E3E0', padding: '14px 16px', fontSize: 14, background: '#F7FBFA', color: '#26403A', cursor: 'pointer', textAlign: 'left' as const },
  overrideRow: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  applyBtn: { borderRadius: 18, border: 'none', padding: '12px 16px', fontWeight: 700, background: '#0F5F4D', color: '#fff', cursor: 'pointer' },
  cancelSmallBtn: { borderRadius: 18, border: '1px solid #D8E3E0', padding: '12px 16px', background: '#F8FAF9', color: '#273C35', cursor: 'pointer' },
  cartBody: { flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 8, paddingBottom: 20 },
  cartList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  cartFooter: { marginTop: 18, paddingTop: 18, borderTop: '1px solid #E7ECEB', background: '#FFFFFF', position: 'sticky', bottom: 0, zIndex: 5, paddingBottom: 20 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 14, color: '#556C6A' },
  totalAmount: { fontSize: 28, fontWeight: 800, color: '#11463D' },
  footerActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  clearButton: { flex: 1, minHeight: 56, borderRadius: 18, border: '1px solid #0F5F4D', background: 'transparent', color: '#0F5F4D', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  checkoutBtn: { flex: 2, minHeight: 56, borderRadius: 18, border: 'none', background: '#0F5F4D', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  mobileSummary: { position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 14, background: '#FFFFFF', borderTop: '1px solid #E7ECEB' },
  mobileTotal: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: '#283A35' },
  mobileCheckoutBtn: { flex: 1, padding: '14px 16px', borderRadius: 14, border: 'none', background: '#0F5F4D', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
}
