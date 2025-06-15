import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalWrapper from '../installer/components/ModalWrapper';

function Wrapper() {
  const [open, setOpen] = useState(true);
  return (
    <ModalWrapper isOpen={open} onClose={() => setOpen(false)}>
      <button>Inside</button>
    </ModalWrapper>
  );
}

test('escape closes modal', async () => {
  render(<Wrapper />);
  await screen.findByText('Inside');
  await userEvent.keyboard('{Escape}');
  expect(screen.queryByText('Inside')).not.toBeInTheDocument();
});
