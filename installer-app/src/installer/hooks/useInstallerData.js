import { useState, useEffect } from 'react';

// Mock data for appointments
const mockAppointments = [
  {
    jobNumber: 'SEA#1041',
    clientName: 'John Doe',
    dueDate: '2025-06-20',
    checklistStatus: 'complete',
    signatureCaptured: true,
  },
  {
    jobNumber: 'SEA#1042',
    clientName: 'Sarah Lee',
    dueDate: '2025-06-21',
    checklistStatus: 'open',
    signatureCaptured: false,
  },
  {
    jobNumber: 'SEA#1043',
    clientName: 'Paul Smith',
    dueDate: '2024-01-01',
    checklistStatus: 'in progress',
    signatureCaptured: false,
  },
];

// Mock data for activity logs
const mockActivityLogs = [
  {
    id: 1,
    timestamp: '2025-06-18T08:00:00Z',
    item: 'Solar Panel',
    qty: -2,
    reason: 'Used in install',
    confirmed: false,
  },
  {
    id: 2,
    timestamp: '2025-06-18T12:00:00Z',
    item: 'Mounting Kit',
    qty: -1,
    reason: 'Used in install',
    confirmed: true,
  },
  {
    id: 3,
    timestamp: '2025-06-19T09:30:00Z',
    item: 'HVAC Sensor',
    qty: 1,
    reason: 'Returned',
    confirmed: false,
  },
];

// Mock data for IFI Dashboard
const mockIFIScores = {
  averageScore: 84.2,
  totalSubmissions: 36,
  belowThresholdCount: 5,
  graphData: [
    { date: '2025-06-14', score: 78 },
    { date: '2025-06-15', score: 82 },
    { date: '2025-06-16', score: 90 },
    { date: '2025-06-17', score: 87 },
    { date: '2025-06-18', score: 84 },
  ],
  tableData: [
    {
      jobNumber: 'SEA#1041',
      installer: 'Connor Preble',
      score: 92,
      date: '2025-06-18',
      issues: 'Missing inventory',
      notes: 'Resolved on site',
    },
    {
      jobNumber: 'SEA#1042',
      installer: 'Sarah Lee',
      score: 88,
      date: '2025-06-18',
      issues: 'Hardware defect',
      notes: 'Replacement ordered',
    },
    {
      jobNumber: 'SEA#1043',
      installer: 'Paul Smith',
      score: 76,
      date: '2025-06-18',
      issues: 'Customer unavailable',
      notes: '',
    },
  ],
};

// useAppointments hook retrieves mock appointment data
export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      setAppointments(JSON.parse(stored));
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setAppointments(mockAppointments);
      localStorage.setItem('appointments', JSON.stringify(mockAppointments));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { appointments, loading };
}

// useActivityLogs hook retrieves mock activity log data
export function useActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('activityLogs');
    if (stored) {
      setLogs(JSON.parse(stored));
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setLogs(mockActivityLogs);
      localStorage.setItem('activityLogs', JSON.stringify(mockActivityLogs));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { logs, loading };
}

// submitInstallerFeedback would normally post to backend
export function submitInstallerFeedback(formData) {
  try {
    const stored = JSON.parse(
      localStorage.getItem('installerFeedbacks') || '[]'
    );
    stored.push({ ...formData, submittedAt: new Date().toISOString() });
    localStorage.setItem('installerFeedbacks', JSON.stringify(stored));
  } catch (err) {
    // localStorage may be unavailable or full
  }
}

// useIFIScores hook provides mock IFI Dashboard metrics
export function useIFIScores() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ifiScores');
    if (stored) {
      setData(JSON.parse(stored));
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setData(mockIFIScores);
      localStorage.setItem('ifiScores', JSON.stringify(mockIFIScores));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
}

// update appointment status in localStorage
export function setAppointmentStatus(jobNumber, status, signature = false) {
  try {
    const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updated = stored.map((appt) =>
      appt.jobNumber === jobNumber
        ? { ...appt, checklistStatus: status, signatureCaptured: signature }
        : appt
    );
    localStorage.setItem('appointments', JSON.stringify(updated));
  } catch (err) {
    // ignore
  }
}
