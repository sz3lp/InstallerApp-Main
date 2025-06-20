import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import JobDetailPage from '../installer/pages/JobDetailPage';

const mockJob = {
  id: 'SEA1042',
  jobNumber: '1042',
  clientName: 'Test Client',
  installDate: '2025-06-01',
  location: 'Test Location',
  installer: 'Alice',
  zones: [
    {
      zoneName: 'Zone 1',
      systemType: 'Type A',
      components: [],
    },
  ],
};

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([mockJob]),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders job number from route', async () => {
  render(
    <MemoryRouter initialEntries={['/job/SEA1042']}>
      <Routes>
        <Route path="/job/:jobId" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() =>
    expect(screen.getByText(/SEA#1042/)).toBeInTheDocument()
  );
});

test('displays calculated installer pay', async () => {
  render(
    <MemoryRouter initialEntries={['/job/SEA1042']}>
      <Routes>
        <Route path="/job/:jobId" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() =>
    expect(screen.getByText(/Total Installer Pay: \$0/)).toBeInTheDocument()
  );
});
