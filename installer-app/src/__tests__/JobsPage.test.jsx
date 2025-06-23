import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobsPage from '../installer/pages/JobsPage';

test('lists jobs from API', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { jobId: 'SEA1001' },
          { jobId: 'SEA1004' },
        ]),
    })
  );

  render(
    <MemoryRouter>
      <JobsPage />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByText('SEA1001')).toBeInTheDocument());
  expect(screen.getByText('SEA1004')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalled();
});
