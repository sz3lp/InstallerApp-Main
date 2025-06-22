import supabase from "../../lib/supabaseClient";

export interface JobZone {
  zoneName: string;
  systemType: string;
  components: { name: string; quantity: number; reusable?: boolean }[];
}

export interface JobDetail {
  id: string;
  jobNumber?: string;
  clientName: string;
  installDate: string;
  location: string;
  installer: string;
  status: string;
  zones: JobZone[];
  documents: any[];
}

export async function getJobById(id: string): Promise<JobDetail | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `id, job_number, client_name, install_date, location, installer, status, zones, documents`
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return {
    id: data.id,
    jobNumber: (data as any).job_number,
    clientName: (data as any).client_name,
    installDate: (data as any).install_date,
    location: data.location,
    installer: data.installer,
    status: data.status,
    zones: (data as any).zones || [],
    documents: data.documents || [],
  } as JobDetail;
}

export interface QAJobListItem {
  id: string;
  address: string;
  assigned_to: string | null;
  status: string;
  scheduled_date: string;
  documents: any[] | null;
}

export async function getJobsNeedingQA(): Promise<QAJobListItem[]> {
  const { data, error } = await supabase
    .from<QAJobListItem>("jobs")
    .select(
      "id, address, assigned_to, status, scheduled_date, documents(id, name, url, path, type)"
    )
    .eq("status", "needs_qa");
  if (error) {
    console.error("Failed to fetch QA jobs", error);
    throw error;
  }
  return data ?? [];
}
