import { renderHook, act } from '@testing-library/react';

const mockFrom = jest.fn();

jest.mock('../lib/supabaseClient', () => ({
  __esModule: true,
  default: { from: mockFrom },
  supabase: { from: mockFrom },
}));

const {
  useAppointments,
  useActivityLogs,
  useIFIScores,
  submitInstallerFeedback,
  setAppointmentStatus,
} = require('../installer/hooks/useInstallerData');

function flush() {
  return new Promise(process.nextTick);
}

beforeEach(() => {
  mockFrom.mockReset();
});

test('useAppointments fetches appointments', async () => {
  const rows = [
    {
      job_number: '123',
      client_name: 'Ann',
      due_date: '2024-01-01',
      checklist_status: 'open',
      signature_captured: false,
    },
  ];
  mockFrom.mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: rows, error: null })),
    update: jest.fn(() => ({ eq: jest.fn() })),
    insert: jest.fn(),
  }));
  const { result } = renderHook(() => useAppointments());
  await act(async () => {
    await flush();
  });
  expect(mockFrom).toHaveBeenCalledWith('jobs');
  expect(result.current.appointments[0].jobNumber).toBe('123');
});

test('useActivityLogs fetches logs', async () => {
  const rows = [
    { id: 1, timestamp: 't', item: 'i', qty: 1, reason: 'r', confirmed: false },
  ];
  mockFrom.mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: rows, error: null })),
  }));
  const { result } = renderHook(() => useActivityLogs());
  await act(async () => {
    await flush();
  });
  expect(mockFrom).toHaveBeenCalledWith('activity_logs');
  expect(result.current.logs.length).toBe(1);
});

test('useIFIScores fetches scores', async () => {
  const rows = [
    { job_number: 'J1', installer: 'A', score: 80, date: 'd', issues: '', notes: '' },
  ];
  mockFrom.mockImplementation(() => ({
    select: jest.fn(() => Promise.resolve({ data: rows, error: null })),
  }));
  const { result } = renderHook(() => useIFIScores());
  await act(async () => {
    await flush();
  });
  expect(mockFrom).toHaveBeenCalledWith('ifi_scores');
  expect(result.current.data.totalSubmissions).toBe(1);
});

test('submitInstallerFeedback inserts row', async () => {
  const insert = jest.fn(() => Promise.resolve({ error: null }));
  mockFrom.mockImplementation(() => ({ insert }));
  await submitInstallerFeedback({ hello: 'world' });
  expect(insert).toHaveBeenCalled();
});

test('setAppointmentStatus updates job', async () => {
  const eq = jest.fn(() => Promise.resolve({ error: null }));
  const update = jest.fn(() => ({ eq }));
  mockFrom.mockImplementation(() => ({ update }));
  await setAppointmentStatus('123', 'complete', true);
  expect(update).toHaveBeenCalledWith({ checklist_status: 'complete', signature_captured: true });
  expect(eq).toHaveBeenCalledWith('job_number', '123');
});

