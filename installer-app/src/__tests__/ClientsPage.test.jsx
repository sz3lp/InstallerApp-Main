import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClientsPage from '../app/clients/ClientsPage';

jest.mock('../lib/hooks/useClinics', () => () => [
  [
    { id: '1', name: 'Acme', contact_name: 'Bob', contact_email: 'bob@example.com', address: '123 St' }
  ],
  {
    loading: false,
    error: null,
    createClinic: jest.fn(),
    updateClinic: jest.fn(),
    deleteClinic: jest.fn(),
  },
]);

test('renders clients table', () => {
  render(
    <MemoryRouter>
      <ClientsPage />
    </MemoryRouter>
  );
  expect(screen.getByText('Clients')).toBeInTheDocument();
  expect(screen.getByText('Acme')).toBeInTheDocument();
});
