import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ActivitySummaryPage from '../installer/pages/ActivitySummaryPage';

test('shows activity summary heading', () => {
  render(
    <MemoryRouter>
      <ActivitySummaryPage />
    </MemoryRouter>
  );
  expect(screen.getByText('Activity Summary')).toBeInTheDocument();
});
