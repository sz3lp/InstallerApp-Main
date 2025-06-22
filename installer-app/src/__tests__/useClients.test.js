const mockData = [
  { id: '1', name: 'Clinic', contact_name: 'Ann', contact_email: 'ann@example.com', address: 'A' },
];

const mockInsert = jest.fn();
const mockFrom = jest.fn();

jest.mock('../lib/supabaseClient', () => ({
  __esModule: true,
  default: { from: mockFrom },
  supabase: { from: mockFrom },
}));

const supabase = require('../lib/supabaseClient').default;
const useClients = require('../lib/hooks/useClients').default;

beforeEach(() => {
  mockFrom.mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
    insert: (...args) => {
      mockInsert(...args);
      return { select: () => ({ single: () => Promise.resolve({ data: mockData[0], error: null }) }) };
    },
    update: jest.fn(() => ({
      eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: mockData[0], error: null }) }) }),
    })),
    delete: jest.fn(() => ({ eq: () => Promise.resolve({ error: null }) })),
  }));
});

import { renderHook, act } from '@testing-library/react';

function flush() {
  return new Promise(process.nextTick);
}

test('fetches clients on load', async () => {
  const { result } = renderHook(() => useClients());
  await act(async () => { await flush(); });
  expect(mockFrom).toHaveBeenCalledWith('clients');
  expect(result.current[0].length).toBe(1);
});

test('createClient calls insert', async () => {
  const { result } = renderHook(() => useClients());
  await act(async () => { await flush(); });
  await act(async () => {
    await result.current[1].createClient({ name: 'New', contact_name: 'n', contact_email: 'n@example.com', address: 'B' });
  });
  expect(mockInsert).toHaveBeenCalled();
});
