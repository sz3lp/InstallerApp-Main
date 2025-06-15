import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstallVerificationStep from '../installer/components/InstallVerificationStep';

const order = {
  zoneCount: 2,
  materials: {
    nodeDevices: 2,
    hubUnits: 1,
    wireFt: 100,
    poeKits: 2,
    mountingKits: 2,
    qrTags: 2,
    spareNodes: 0,
  },
};

function setup() {
  const onComplete = jest.fn();
  render(<InstallVerificationStep salesOrder={order} onComplete={onComplete} />);
  return { onComplete };
}

test('shows over warning when count exceeds quoted', async () => {
  setup();
  const input = screen.getByLabelText('nodeDevices');
  await userEvent.type(input, '3');
  expect(screen.getByText(/call manager/i)).toBeInTheDocument();
});

test('shows missing warning when count below quoted', async () => {
  setup();
  const input = screen.getByLabelText('hubUnits');
  await userEvent.type(input, '0');
  expect(screen.getByText(/missing required install/i)).toBeInTheDocument();
});

test('allows 10% wire overage without warning', async () => {
  setup();
  const input = screen.getByLabelText('wireFt');
  await userEvent.type(input, '105');
  expect(screen.getByText(/matched expected/i)).toBeInTheDocument();
});

test('next disabled until zones installed matches', async () => {
  const { onComplete } = setup();
  const next = screen.getByRole('button', { name: /next/i });
  expect(next).toBeDisabled();
  await userEvent.type(screen.getByLabelText('Zones Installed'), '2');
  for (const key of Object.keys(order.materials)) {
    await userEvent.type(screen.getByLabelText(key), String(order.materials[key]));
  }
  expect(next).toBeEnabled();
  await userEvent.click(next);
  expect(onComplete).toHaveBeenCalled();
});
