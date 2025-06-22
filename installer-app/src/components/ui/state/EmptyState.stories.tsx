import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/State/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};
export default meta;

export const Basic: StoryObj<typeof EmptyState> = {
  args: {
    title: 'No Items',
    description: 'There is nothing here yet.',
  },
};

export const WithAction: StoryObj<typeof EmptyState> = {
  args: {
    title: 'No Quotes Found',
    actionLabel: 'Create Quote',
  },
};
