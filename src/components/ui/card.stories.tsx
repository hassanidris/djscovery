import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    size: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>
            This is a card description that provides additional context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the card content area where you can place any content.</p>
        </CardContent>
        <CardFooter>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
            Action
          </button>
        </CardFooter>
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: (
      <>
        <CardHeader>
          <CardTitle>Small Card</CardTitle>
          <CardDescription>A compact card variant</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Compact content for smaller spaces.</p>
        </CardContent>
      </>
    ),
  },
};

export const WithAction: Story = {
  args: {
    size: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card with Action</CardTitle>
          <CardDescription>
            This card has an action button in the header
          </CardDescription>
          <CardAction>
            <button className="px-3 py-1.5 text-sm bg-accent text-accent-foreground rounded">
              Edit
            </button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Content with header action button positioned to the right.</p>
        </CardContent>
      </> 
    ),
  },
};

export const Minimal: Story = {
  args: {
    size: 'default',
    children: (
      <CardContent>
        <p>A minimal card with only content, no header or footer.</p>
      </CardContent>
    ),
  },
};
