import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppointmentSummaryPage from '../installer/pages/AppointmentSummaryPage';

var mockFrom;
jest.mock('../lib/supabaseClient', () => {
  mockFrom = jest.fn();
  return {
    __esModule: true,
    default: { from: mockFrom },
    supabase: { from: mockFrom },
  };
});

beforeEach(() => {
  mockFrom.mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  }));
});

test('shows job cards with status badge', () => {
  const jobs = [
    {
      jobNumber: 'SEA#1042',
      clientName: 'Lincoln Elementary',
      dueDate: '2025-06-20',
      checklistStatus: 'complete',
      signatureCaptured: true,
    },
  ];
  render(
    <MemoryRouter>
      <AppointmentSummaryPage jobs={jobs} />
    </MemoryRouter>
  );
  expect(screen.getByText('Appointment Summary')).toBeInTheDocument();
  expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
  expect(screen.getByText('SEA#1042')).toBeInTheDocument();
  expect(screen.getByLabelText('complete')).toBeInTheDocument();
});
