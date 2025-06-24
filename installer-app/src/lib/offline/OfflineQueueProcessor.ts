// OfflineQueueProcessor.ts
import supabase from "../supabaseClient";

export interface OfflineAction {
  table: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface OfflineQueueState {
  pending: number;
  syncing: boolean;
}

export type QueueListener = (state: OfflineQueueState) => void;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("offline-actions", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("queue")) {
        db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class OfflineQueueProcessor {
  private dbPromise: Promise<IDBDatabase>;
  private listeners = new Set<QueueListener>();
  private syncing = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.dbPromise = openDatabase();
      window.addEventListener("online", () => this.processQueue());
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (e) => {
          if (e.data?.type === "SYNC_OFFLINE_QUEUE") {
            this.processQueue();
          }
        });
      }
      this.emitState();
    }
  }

  onChange(listener: QueueListener) {
    this.listeners.add(listener);
    this.emitState();
    return () => this.listeners.delete(listener);
  }

  private async emitState() {
    const pending = await this.getQueueLength();
    const state = { pending, syncing: this.syncing };
    this.listeners.forEach((l) => l(state));
  }

  private async getQueueLength(): Promise<number> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("queue", "readonly");
      const store = tx.objectStore("queue");
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async getAllActions(): Promise<(OfflineAction & { id: number })[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("queue", "readonly");
      const store = tx.objectStore("queue");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as any);
      req.onerror = () => reject(req.error);
    });
  }

  private async removeAction(id: number): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("queue", "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore("queue").delete(id);
    }).then(() => this.emitState());
  }

  async enqueue(table: string, data: Record<string, any>): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("queue", "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore("queue").add({ table, data, timestamp: Date.now() });
    })
      .then(() => this.emitState())
      .then(async () => {
        if (
          "serviceWorker" in navigator &&
          "SyncManager" in window &&
          navigator.serviceWorker
        ) {
          try {
            const reg = await navigator.serviceWorker.ready;
            await reg.sync.register("sync-offline");
          } catch {
            // ignore registration errors
          }
        }
      });
  }

  private async sendToSupabase(action: OfflineAction) {
    await supabase.from(action.table).upsert(action.data);
  }

  async processQueue() {
    if (this.syncing || !navigator.onLine) return;
    this.syncing = true;
    await this.emitState();
    const actions = await this.getAllActions();
    for (const item of actions) {
      try {
        await this.sendToSupabase(item);
        await this.removeAction(item.id);
      } catch (err) {
        console.error("Failed to sync action", err);
        break;
      }
    }
    this.syncing = false;
    await this.emitState();
  }
}

const offlineQueueProcessor = new OfflineQueueProcessor();
export default offlineQueueProcessor;
