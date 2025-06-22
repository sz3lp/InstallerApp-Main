import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import InstallerHomePage from '../app/installer/InstallerHomePage';
import AppointmentSummaryPage from '../app/installer/appointments/AppointmentSummaryPage';
import ActivitySummaryPage from '../app/installer/activity/ActivitySummaryPage';
import IFIDashboard from '../app/installer/dashboard/IFIDashboard';
import FeedbackPage from '../app/installer/FeedbackPage';

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
  const [link] = await screen.findAllByRole('link', { name: 'Activity Summary' });
  await userEvent.click(link);
  expect(await screen.findByText('Activity Summary')).toBeInTheDocument();
});
