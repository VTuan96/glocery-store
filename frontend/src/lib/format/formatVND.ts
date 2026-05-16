/**
 * Format a VND integer amount as Vietnamese thousand-separated currency.
 * This is the ONLY place VND is formatted — never format inline.
 *
 * @example formatVND(35000) → "35.000đ"
 * @example formatVND(1000000) → "1.000.000đ"
 * @example formatVND(0) → "0đ"
 */
export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}
