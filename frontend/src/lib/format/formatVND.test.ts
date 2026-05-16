import { describe, it, expect } from 'vitest'
import { formatVND } from './formatVND'

describe('formatVND', () => {
  it('formats zero', () => {
    expect(formatVND(0)).toBe('0đ')
  })

  it('formats thousands with dot separator', () => {
    expect(formatVND(35000)).toBe('35.000đ')
  })

  it('formats millions', () => {
    expect(formatVND(1000000)).toBe('1.000.000đ')
  })

  it('formats small amounts under 1000', () => {
    expect(formatVND(500)).toBe('500đ')
  })

  it('appends đ suffix', () => {
    expect(formatVND(10000).endsWith('đ')).toBe(true)
  })
})
