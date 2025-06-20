import { useState, useEffect, useCallback, useRef } from 'react';
import { get, set, Store } from 'idb-keyval';

export interface SyncUpdate {
  field: string;
  value: any;
  timestamp: number;
}

export interface SyncState {
  jobId: string;
  updates: SyncUpdate[];
  synced: boolean;
  lastAttempt?: number;
  error?: string;
}

const store = new Store('job-sync-db', 'updates');

async function loadUpdates(jobId: string): Promise<SyncUpdate[]> {
  return (await get(`updates:${jobId}`, store)) || [];
}

async function saveUpdates(jobId: string, updates: SyncUpdate[]) {
  await set(`updates:${jobId}`, updates, store);
}

export function useJobSync(jobId: string) {
  const [state, setState] = useState<SyncState>({ jobId, updates: [], synced: true });
  const backoffRef = useRef(1000);
  const syncingRef = useRef(false);

  const refreshFromDB = useCallback(async () => {
    const queued = await loadUpdates(jobId);
    setState(prev => ({ ...prev, updates: queued }));
  }, [jobId]);

  const attemptSync = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return;
    syncingRef.current = true;
    const queued = await loadUpdates(jobId);
    if (queued.length === 0) {
      setState(prev => ({ ...prev, synced: true, updates: [] }));
      backoffRef.current = 1000;
      syncingRef.current = false;
      return;
    }
    try {
      const res = await fetch(`/api/jobs/${jobId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: queued }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await saveUpdates(jobId, []);
      setState(prev => ({ ...prev, synced: true, updates: [], lastAttempt: Date.now(), error: undefined }));
      backoffRef.current = 1000;
    } catch (err: any) {
      setState(prev => ({ ...prev, synced: false, lastAttempt: Date.now(), error: err?.message || 'Sync failed' }));
      setTimeout(attemptSync, backoffRef.current);
      backoffRef.current = Math.min(backoffRef.current * 2, 60000);
    } finally {
      syncingRef.current = false;
    }
  }, [jobId]);

  const submitUpdate = useCallback(
    async (field: string, value: any) => {
      const update: SyncUpdate = { field, value, timestamp: Date.now() };
      const queued = await loadUpdates(jobId);
      const newQueue = [...queued, update];
      await saveUpdates(jobId, newQueue);
      setState(prev => ({ ...prev, updates: newQueue, synced: false }));
      if (navigator.onLine) attemptSync();
    },
    [jobId, attemptSync]
  );

  useEffect(() => {
    refreshFromDB();
  }, [refreshFromDB]);

  useEffect(() => {
    if (navigator.onLine) attemptSync();
    const onlineHandler = () => attemptSync();
    window.addEventListener('online', onlineHandler);
    return () => window.removeEventListener('online', onlineHandler);
  }, [attemptSync]);

  return { state, submitUpdate };
}

export default useJobSync;
