export interface QueueItem {
  url: string;
  options?: RequestInit;
}

class OfflineDataSyncManager {
  private queueKey = "offlineQueue";
  private isFlushing = false;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.flushQueue());
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "SYNC_OFFLINE_QUEUE") {
            this.flushQueue();
          }
        });
      }
    }
  }

  private getQueue(): QueueItem[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(this.queueKey) || "[]");
    } catch {
      return [];
    }
  }

  private saveQueue(queue: QueueItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  async queueRequest(
    url: string,
    options?: RequestInit,
  ): Promise<Response | void> {
    if (navigator.onLine) {
      try {
        return await fetch(url, options);
      } catch (err) {
        console.error("Request failed, queuing", err);
      }
    }
    this.addToQueue({ url, options });
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register("sync-offline");
      } catch (e) {
        console.error("Background sync registration failed", e);
      }
    }
  }

  private addToQueue(item: QueueItem): void {
    const queue = this.getQueue();
    queue.push(item);
    this.saveQueue(queue);
  }

  async flushQueue(): Promise<void> {
    if (this.isFlushing) return;
    this.isFlushing = true;
    let queue = this.getQueue();
    while (queue.length && navigator.onLine) {
      const item = queue[0];
      try {
        await fetch(item.url, item.options);
        queue.shift();
        this.saveQueue(queue);
      } catch (err) {
        console.error("Failed to sync item", err);
        break;
      }
    }
    this.isFlushing = false;
  }
}

const offlineDataSyncManager = new OfflineDataSyncManager();
export default offlineDataSyncManager;
