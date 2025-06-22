import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'UI/State/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
};
export default meta;

export const Basic: StoryObj<typeof ErrorState> = {
  args: {},
};

export const CustomMessage: StoryObj<typeof ErrorState> = {
  args: { message: 'Failed to fetch data' },
};
