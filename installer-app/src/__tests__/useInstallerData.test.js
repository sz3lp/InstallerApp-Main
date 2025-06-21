import { renderHook, act } from '@testing-library/react';
import {
  useAppointments,
  useActivityLogs,
  useIFIScores,
  submitInstallerFeedback,
  setAppointmentStatus,
} from '../installer/hooks/useInstallerData';

jest.useFakeTimers();

function advance() {
  act(() => {
    jest.runAllTimers();
  });
}

test('useAppointments returns mock data', () => {
  const { result } = renderHook(() => useAppointments());
  advance();
  expect(result.current.appointments.length).toBeGreaterThan(0);
});

test('useActivityLogs returns mock data', () => {
  const { result } = renderHook(() => useActivityLogs());
  advance();
  expect(result.current.logs.length).toBeGreaterThan(0);
});

test('useIFIScores returns mock data', () => {
  const { result } = renderHook(() => useIFIScores());
  advance();
  expect(result.current.data).toBeTruthy();
});

test('submitInstallerFeedback posts feedback', async () => {
  global.fetch.mockClear();
  await submitInstallerFeedback({ hello: 'world' });
  expect(global.fetch).toHaveBeenCalledWith(
    '/api/feedback',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    })
  );
});

test('setAppointmentStatus updates storage', () => {
  localStorage.setItem(
    'appointments',
    JSON.stringify([{ jobNumber: '123', checklistStatus: 'open', signatureCaptured: false }])
  );
  setAppointmentStatus('123', 'complete', true);
  const stored = JSON.parse(localStorage.getItem('appointments'));
  expect(stored[0].checklistStatus).toBe('complete');
  expect(stored[0].signatureCaptured).toBe(true);
});
