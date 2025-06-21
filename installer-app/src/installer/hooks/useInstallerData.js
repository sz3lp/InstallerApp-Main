import { useState, useEffect } from 'react';
import supabase from '../../lib/supabaseClient';


// useAppointments hook retrieves mock appointment data
export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchAppointments() {
      const { data, error } = await supabase
        .from('jobs')
        .select(
          'job_number, client_name, due_date, checklist_status, signature_captured',
        )
        .order('due_date', { ascending: true });
      if (!ignore) {
        if (error) {
          console.error('Failed to fetch appointments', error);
          setAppointments([]);
        } else {
          const mapped = (data ?? []).map((row) => ({
            jobNumber: row.job_number ?? row.id,
            clientName: row.client_name,
            dueDate: row.due_date,
            checklistStatus: row.checklist_status,
            signatureCaptured: row.signature_captured ?? false,
          }));
          setAppointments(mapped);
        }
        setLoading(false);
      }
    }
    fetchAppointments();
    return () => {
      ignore = true;
    };
  }, []);

  return { appointments, loading };
}

// useActivityLogs hook retrieves mock activity log data
export function useActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, timestamp, item, qty, reason, confirmed')
        .order('timestamp', { ascending: false });
      if (!ignore) {
        if (error) {
          console.error('Failed to fetch activity logs', error);
          setLogs([]);
        } else {
          setLogs(data ?? []);
        }
        setLoading(false);
      }
    }
    fetchLogs();
    return () => {
      ignore = true;
    };
  }, []);

  return { logs, loading };
}

// submitInstallerFeedback would normally post to backend
export async function submitInstallerFeedback(formData) {
  try {
    await supabase.from('installer_feedback').insert({
      ...formData,
      submitted_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to submit feedback', err);
  }
}

// useIFIScores hook provides mock IFI Dashboard metrics
export function useIFIScores() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchScores() {
      const { data: rows, error } = await supabase
        .from('ifi_scores')
        .select('job_number, installer, score, date, issues, notes');
      if (!ignore) {
        if (error) {
          console.error('Failed to fetch IFI scores', error);
          setData(null);
        } else {
          const tableData = rows ?? [];
          const scores = tableData.map((r) => r.score || 0);
          const averageScore =
            scores.reduce((sum, s) => sum + s, 0) / (scores.length || 1);
          const belowThresholdCount = scores.filter((s) => s < 90).length;
          setData({
            averageScore,
            totalSubmissions: tableData.length,
            belowThresholdCount,
            graphData: [],
            tableData,
          });
        }
        setLoading(false);
      }
    }
    fetchScores();
    return () => {
      ignore = true;
    };
  }, []);

  return { data, loading };
}

// update appointment status in localStorage
export async function setAppointmentStatus(jobNumber, status, signature = false) {
  try {
    await supabase
      .from('jobs')
      .update({ checklist_status: status, signature_captured: signature })
      .eq('job_number', jobNumber);
  } catch (err) {
    console.error('Failed to update appointment status', err);
  }
}
