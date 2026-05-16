import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'
import type { Product } from '../../../types/global'

export function useBarcode(onFound: (product: Product, quantity: number) => void) {
  const [scanning, setScanning] = useState(false)
  const [notFound, setNotFound] = useState<string | null>(null)
  const storeId = useAuthStore((s) => s.storeId)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<import('@zxing/browser').BrowserMultiFormatReader | null>(null)

  const resolveBarcode = useCallback(async (code: string) => {
    try {
      const { data } = await apiClient.get<Product>(`/products/barcode/${code}`, {
        params: { storeId },
      })
      onFound(data, 1)
      setNotFound(null)
    } catch {
      setNotFound(code)
      // Auto-dismiss the not-found warning after 5 seconds
      setTimeout(() => setNotFound(null), 5000)
    }
  }, [storeId, onFound])

  async function startScan() {
    setScanning(true)
    setNotFound(null)
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    try {
      await reader.decodeFromVideoDevice(undefined, videoRef.current!, async (result) => {
        if (result) {
          stopScan()
          await resolveBarcode(result.getText())
        }
      })
    } catch {
      setScanning(false)
    }
  }

  function stopScan() {
    readerRef.current?.reset()
    setScanning(false)
  }

  // USB HID scanner — keyboard events
  useEffect(() => {
    let buffer = ''
    let timer: ReturnType<typeof setTimeout>

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' && buffer.length > 3) {
        resolveBarcode(buffer)
        buffer = ''
      } else if (e.key.length === 1) {
        buffer += e.key
        clearTimeout(timer)
        timer = setTimeout(() => { buffer = '' }, 100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown); clearTimeout(timer) }
  }, [resolveBarcode])

  return { scanning, notFound, videoRef, startScan, stopScan, resolveBarcode }
}
