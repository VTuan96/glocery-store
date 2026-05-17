import { useEffect, useState } from 'react'
import { VndInput } from '../../../components/ui/VndInput'
import { formatVND } from '../../../lib/format/formatVND'
import type { Product, ProductType } from '../../../types/global'

interface ProductFormProps {
  initial?: Partial<Product>
  onSave: (data: ProductPayload, file?: File) => Promise<void>
  onCancel?: () => void
}

export interface ProductPayload {
  name: string
  type: ProductType
  defaultPrice: number
  barcodes: string[]
  packUnits: { name: string; quantity: number }[]
  pricingTiers: { minQuantity: number; unitPrice: number }[]
}

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'NORMAL', label: 'Thường' },
  { value: 'WEIGHT', label: 'Cân' },
  { value: 'SPLIT', label: 'Tách lẻ' },
]

export function ProductForm({ initial, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<ProductType>(initial?.type ?? 'NORMAL')
  const [defaultPrice, setDefaultPrice] = useState(initial?.defaultPrice ?? 0)
  const [barcodes, setBarcodes] = useState<string[]>(initial?.barcodes ?? [])
  const [newBarcode, setNewBarcode] = useState('')
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [imageStatus, setImageStatus] = useState('')
  const [packUnits, setPackUnits] = useState<{ name: string; quantity: number }[]>(
    initial?.packUnits ?? []
  )
  const [pricingTiers, setPricingTiers] = useState<{ minQuantity: number; unitPrice: number }[]>(
    initial?.pricingTiers ?? []
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(undefined)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => { URL.revokeObjectURL(url) }
  }, [imageFile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Tên sản phẩm là bắt buộc'); return }
    if (defaultPrice <= 0) { setError('Giá phải lớn hơn 0'); return }
    setError(''); setSaving(true)
    try {
      await onSave(
        { name: name.trim(), type, defaultPrice, barcodes, packUnits, pricingTiers },
        imageFile,
      )
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Không thể lưu sản phẩm')
    } finally { setSaving(false) }
  }

  function addBarcode() {
    if (!newBarcode.trim() || barcodes.includes(newBarcode.trim())) return
    setBarcodes([...barcodes, newBarcode.trim()])
    setNewBarcode('')
  }

  function addTier() {
    setPricingTiers([...pricingTiers, { minQuantity: 1, unitPrice: 0 }])
  }

  return (
    <form onSubmit={handleSave} style={styles.form}>
      {/* Name */}
      <label style={styles.label}>Tên sản phẩm *</label>
      <input value={name} onChange={(e) => setName(e.target.value)}
        style={styles.input} aria-label="Tên sản phẩm" placeholder="Tên sản phẩm" />

      {/* Type */}
      <label style={styles.label}>Loại sản phẩm</label>
      <div style={styles.typeRow}>
        {PRODUCT_TYPES.map((t) => (
          <button key={t.value} type="button"
            onClick={() => setType(t.value)}
            style={{ ...styles.typeBtn, background: type === t.value ? '#00695C' : '#e0e0e0',
              color: type === t.value ? '#fff' : '#333' }}
            aria-pressed={type === t.value}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Default price */}
      <label style={styles.label}>Giá mặc định *</label>
      <VndInput value={defaultPrice} onChange={setDefaultPrice} label="Giá mặc định (VND)" />

      {/* Barcodes */}
      <label style={styles.label}>Mã vạch</label>
      <div style={styles.row}>
        <input value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)}
          style={{ ...styles.input, flex: 1 }} placeholder="Nhập hoặc quét mã vạch"
          aria-label="Mã vạch mới" />
        <button type="button" onClick={addBarcode} style={styles.addBtn}>Thêm</button>
      </div>
      {barcodes.map((b, i) => (
        <div key={i} style={styles.tag}>
          {b}
          <button type="button" onClick={() => setBarcodes(barcodes.filter((_, j) => j !== i))}
            style={styles.removeBtn} aria-label={`Xoá mã vạch ${b}`}>×</button>
        </div>
      ))}

      {/* Pricing tiers */}
      <label style={styles.label}>Giá theo số lượng</label>
      {pricingTiers.map((tier, i) => (
        <div key={i} style={styles.tierRow}>
          <input type="number" min={1} value={tier.minQuantity}
            onChange={(e) => {
              const updated = [...pricingTiers]
              updated[i] = { ...updated[i], minQuantity: parseInt(e.target.value) || 1 }
              setPricingTiers(updated)
            }}
            style={{ ...styles.input, width: 80 }} aria-label={`Số lượng tối thiểu bậc ${i + 1}`} />
          <span style={{ alignSelf: 'center' }}>sp trở lên:</span>
          <VndInput value={tier.unitPrice}
            onChange={(v) => {
              const updated = [...pricingTiers]
              updated[i] = { ...updated[i], unitPrice: v }
              setPricingTiers(updated)
            }}
            label={`Giá bậc ${i + 1}`}
            style={{ flex: 1, fontSize: 18 }} />
          <button type="button"
            onClick={() => setPricingTiers(pricingTiers.filter((_, j) => j !== i))}
            style={styles.removeBtn} aria-label={`Xoá bậc giá ${i + 1}`}>×</button>
        </div>
      ))}
      <button type="button" onClick={addTier} style={styles.addBtn}>+ Thêm bậc giá</button>

      <label style={styles.label}>Hình ảnh sản phẩm</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          setImageFile(file)
          setImageStatus(file ? `Ảnh đã chọn: ${file.name}` : '')
        }}
        style={styles.input}
        aria-label="Chọn hình ảnh sản phẩm"
      />
      {imageStatus && <div style={styles.imageStatus}>{imageStatus}</div>}
      {!imageStatus && !initial?.imageUrl && (
        <div style={styles.imageStatus}>Chọn ảnh để khách hàng dễ nhận diện sản phẩm.</div>
      )}
      {(initial?.imageUrl || previewUrl) && (
        <img
          src={previewUrl ?? initial.imageUrl}
          alt={initial?.name ?? 'Hình ảnh sản phẩm'}
          style={styles.preview}
        />
      )}

      {error && <div style={styles.error} role="alert">{error}</div>}

      <div style={styles.actions}>
        {onCancel && <button type="button" onClick={onCancel} style={styles.cancelBtn}>Huỷ</button>}
        <button type="submit" disabled={saving} style={styles.saveBtn}>
          {saving ? '...' : 'Lưu sản phẩm'}
        </button>
      </div>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Inter, sans-serif' },
  label: { fontSize: 14, fontWeight: 600, color: '#555', marginTop: 8 },
  input: { padding: '10px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 8, minHeight: 48 },
  typeRow: { display: 'flex', gap: 8 },
  typeBtn: { flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', minHeight: 48 },
  row: { display: 'flex', gap: 8 },
  addBtn: { padding: '10px 16px', background: '#e0f2f1', border: 'none', borderRadius: 8, cursor: 'pointer', minHeight: 48 },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0f2f1', borderRadius: 6, padding: '4px 10px', fontSize: 14 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#C62828', minHeight: 32, minWidth: 32 },
  tierRow: { display: 'flex', gap: 8, alignItems: 'center' },
  error: { color: '#C62828', fontSize: 14 },
  imageStatus: { color: '#555', fontSize: 13, marginTop: 6, marginBottom: 6 },
  actions: { display: 'flex', gap: 8, marginTop: 8 },
  cancelBtn: { flex: 1, padding: '12px 0', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
  saveBtn: { flex: 2, padding: '12px 0', background: '#00695C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', minHeight: 48 },
  preview: { width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12, marginTop: 12 },
}
