import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../lib/api/client'
import { db } from '../../../lib/db'
import { useNetworkStore } from '../../../store/networkStore'
import { useAuthStore } from '../../../store/authStore'
import { mapServerProduct } from '../../products/hooks/useProducts'
import type { Product } from '../../../types/global'

export function useBarcode(onFound: (product: Product, quantity: number) => void) {
  const [scanning, setScanning] = useState(false)
  const isOnline = useNetworkStore((s) => s.isOnline)
  const [notFound, setNotFound] = useState<string | null>(null)
  const storeId = useAuthStore((s) => s.storeId)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<import('@zxing/browser').BrowserMultiFormatReader | null>(null)

  const resolveBarcode = useCallback(async (code: string) => {
    if (!storeId) {
      setNotFound(code)
      setTimeout(() => setNotFound(null), 5000)
      return
    }

    async function fallbackLocal(): Promise<boolean> {
      const product = await db.products.where('storeId').equals(storeId).toArray()
        .then((products) => products.find((p) => p.barcodes?.some((barcode) => barcode === code)))
      if (product) {
        onFound(product, 1)
        return true
      }
      return false
    }

    if (!isOnline) {
      const found = await fallbackLocal()
      if (!found) {
        setNotFound(code)
        setTimeout(() => setNotFound(null), 5000)
      }
      return
    }

    try {
      const { data } = await apiClient.get<Product>(`/products/barcode/${code}`, {
        params: { storeId },
      })
      const product = mapServerProduct(data as Product & { id: string }, storeId)
      onFound(product, 1)
      setNotFound(null)
    } catch {
      const found = await fallbackLocal()
      if (!found) {
        setNotFound(code)
        setTimeout(() => setNotFound(null), 5000)
      }
    }
  }, [storeId, onFound, isOnline])

  function startScan() {
    setScanning(true)
    setNotFound(null)
  }

  function stopScan() {
    readerRef.current?.reset()
    readerRef.current = null
    setScanning(false)
  }

  useEffect(() => {
    if (!scanning) return
    if (!videoRef.current) return

    let active = true
    let reader: import('@zxing/browser').BrowserMultiFormatReader | null = null

    async function beginScan() {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      reader = new BrowserMultiFormatReader()
      readerRef.current = reader
      try {
        await reader.decodeFromVideoDevice(undefined, videoRef.current!, async (result) => {
          if (!active || !result) return
          stopScan()
          await resolveBarcode(result.getText())
        })
      } catch {
        if (active) {
          setScanning(false)
        }
      }
    }

    beginScan()

    return () => {
      active = false
      reader?.reset()
    }
  }, [scanning, resolveBarcode])

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
