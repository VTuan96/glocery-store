import { db } from '../db'
import { apiClient } from '../api/client'
import { useNetworkStore } from '../../store/networkStore'

/**
 * Flush all pending sync queue entries to the server.
 * Called automatically when navigator.onLine becomes true.
 * Idempotent — safe to call multiple times.
 */
export async function flushSyncQueue(): Promise<void> {
  const pending = await db.syncQueue.where('syncStatus').equals('pending').toArray()
  if (pending.length === 0) return

  try {
    const { data } = await apiClient.post('/sync/push', {
      operations: pending.map((op) => ({
        clientId: op.clientId,
        type: op.type,
        payload: op.payload,
        clientTimestamp: op.clientTimestamp,
      })),
    })

    // Mark processed as synced
    const processedIds = new Set<string>(data.processed ?? [])
    for (const op of pending) {
      if (processedIds.has(op.clientId)) {
        await db.syncQueue.where('clientId').equals(op.clientId).modify({ syncStatus: 'synced' })
      } else {
        await db.syncQueue.where('clientId').equals(op.clientId).modify({
          retryCount: (op.retryCount ?? 0) + 1,
          updatedAt: new Date().toISOString(),
        })
      }
    }
  } catch {
    // Silent failure — stays in queue for next retry
  }
}

/**
 * Returns count of pending sync operations.
 */
export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where('syncStatus').equals('pending').count()
}
