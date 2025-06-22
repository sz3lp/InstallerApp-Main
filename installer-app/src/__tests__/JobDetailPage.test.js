import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import JobDetailPage from '../app/installer/jobs/JobDetailPage';

test('renders job number from route', () => {
  render(
    <MemoryRouter initialEntries={['/job/SEA1042']}>
      <Routes>
        <Route path="/job/:jobId" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/SEA#1042/)).toBeInTheDocument();
});

test('displays calculated installer pay', () => {
  render(
    <MemoryRouter initialEntries={['/job/SEA1042']}>
      <Routes>
        <Route path="/job/:jobId" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Total Installer Pay: \$0/)).toBeInTheDocument();
});
