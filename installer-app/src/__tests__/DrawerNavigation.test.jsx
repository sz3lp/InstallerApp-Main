import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import InstallerHomePage from '../installer/pages/InstallerHomePage';
import AppointmentSummaryPage from '../installer/pages/AppointmentSummaryPage';
import ActivitySummaryPage from '../installer/pages/ActivitySummaryPage';
import IFIDashboard from '../installer/pages/IFIDashboard';
import FeedbackPage from '../installer/pages/FeedbackPage';

test('navigates via side drawer links', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<InstallerHomePage />} />
        <Route path="/appointments" element={<AppointmentSummaryPage />} />
        <Route path="/activity" element={<ActivitySummaryPage />} />
        <Route path="/ifi" element={<IFIDashboard />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </MemoryRouter>
  );
  // open drawer
  await userEvent.click(screen.getByLabelText(/open menu/i));
  // click Activity Summary link
  const link = await screen.findByRole('link', { name: 'Activity Summary' });
  await userEvent.click(link);
  expect(await screen.findByText('Activity Summary')).toBeInTheDocument();
});
