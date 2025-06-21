import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import JobDetailPage from '../installer/pages/JobDetailPage';

test('renders job number from route', () => {
  render(
    <MemoryRouter initialEntries={['/job/SEA1042']}>
      <Routes>
        <Route path="/job/:id" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/SEA#1042/)).toBeInTheDocument();
});

test('displays calculated installer pay', () => {
  render(
    <MemoryRouter initialEntries={['/job/SEA1042']}>
      <Routes>
        <Route path="/job/:id" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Total Installer Pay: \$0/)).toBeInTheDocument();
});
