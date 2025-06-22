import useJobDetail from "../lib/hooks/useJobDetail";
import { useChecklist } from "../lib/hooks/useChecklist";
import { useJobMaterials } from "../lib/hooks/useJobMaterials";

export function useJob(jobId: string | null) {
  const { job, loading, error, refresh } = useJobDetail(jobId);
  const { items: checklist, loading: clLoading } = useChecklist(jobId || "");
  const { items: materials, loading: matLoading } = useJobMaterials(jobId || "");
  const combinedLoading = loading || clLoading || matLoading;
  return {
    job: job ? { ...job, checklist, materials } : null,
    loading: combinedLoading,
    error,
    refresh,
  } as const;
}
