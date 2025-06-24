import { useEffect, useState } from "react";
import offlineQueueProcessor, {
  OfflineQueueState,
} from "./OfflineQueueProcessor";

export default function useOfflineQueue() {
  const [state, setState] = useState<OfflineQueueState>({
    pending: 0,
    syncing: false,
  });

  useEffect(() => {
    const unsub = offlineQueueProcessor.onChange(setState);
    return () => {
      unsub();
    };
  }, []);

  return state;
}
