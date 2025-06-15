import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityCard from '../installer/components/ActivityCard';

function Wrapper() {
  const [confirmed, setConfirmed] = useState(false);
  const activity = {
    id: 1,
    timestamp: 'now',
    item: 'Item',
    qty: 1,
    reason: 'reason',
    confirmed,
  };
  return (
    <ActivityCard
      activity={activity}
      onToggle={() => setConfirmed((c) => !c)}
    />
  );
}

test('checkbox toggles confirmation', async () => {
  render(<Wrapper />);
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).not.toBeChecked();
  await userEvent.click(checkbox);
  expect(screen.getByRole('checkbox')).toBeChecked();
});
