import type { Meta, StoryObj } from '@storybook/react';
import { LoadingState } from './LoadingState';

const meta: Meta<typeof LoadingState> = {
  title: 'UI/State/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
};
export default meta;

export const List: StoryObj<typeof LoadingState> = {
  args: { type: 'list' },
};

export const Detail: StoryObj<typeof LoadingState> = {
  args: { type: 'detail' },
};

export const Inline: StoryObj<typeof LoadingState> = {
  args: { type: 'inline', message: 'Loading...' },
};
