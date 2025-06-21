import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockJobsPage from '../installer/pages/MockJobsPage';

test('lists mock jobs', () => {
  render(
    <MemoryRouter>
      <MockJobsPage />
    </MemoryRouter>
  );
  expect(screen.getByText('SEA1001')).toBeInTheDocument();
  expect(screen.getByText('SEA1004')).toBeInTheDocument();
});
