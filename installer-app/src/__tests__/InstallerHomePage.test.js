import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InstallerHomePage from '../installer/pages/InstallerHomePage';

test('renders welcome heading', () => {
  render(
    <MemoryRouter>
      <InstallerHomePage />
    </MemoryRouter>
  );
  expect(screen.getByText('Welcome!')).toBeInTheDocument();
});
