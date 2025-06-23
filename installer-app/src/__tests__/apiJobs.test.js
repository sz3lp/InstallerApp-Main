import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

const sample = [{ id: '123', clinic_name: 'Clinic', address: 'Addr', assigned_to: 'u1', status: 'assigned' }];

const mockOrder = jest.fn().mockResolvedValue({ data: sample, error: null });
const mockFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: mockOrder,
}));

createClient.mockReturnValue({ from: mockFrom });

async function loadHandler() {
  const mod = await import('../../api/jobs.js');
  return mod.default;
}

function createRes() {
  const json = jest.fn();
  return {
    status: jest.fn(() => ({ json })),
    json,
  };
}

test('fetches jobs from supabase', async () => {
  const handler = await loadHandler();
  const req = { method: 'GET', query: { assignedTo: 'u1' } };
  const res = createRes();

  await handler(req, res);

  expect(createClient).toHaveBeenCalled();
  expect(mockFrom).toHaveBeenCalledWith('jobs');
  expect(mockOrder).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.status.mock.calls[0][0]).toBe(200);
  expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith([
    {
      jobId: '123',
      customerName: 'Clinic',
      address: 'Addr',
      assignedTo: 'u1',
      status: 'assigned',
      zones: [],
    },
  ]);
});
