import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Default",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link Badge",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Archived</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <span className="mr-1" aria-hidden>
          ✓
        </span>
        Verified
      </Badge>
      <Badge variant="destructive">
        <span className="mr-1" aria-hidden>
          !
        </span>
        Alert
      </Badge>
      <Badge variant="secondary">
        <span className="mr-1" aria-hidden>
          i
        </span>
        Info
      </Badge>
    </div>
  ),
};

export const CountBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>12</Badge>
      <Badge variant="secondary">24</Badge>
      <Badge variant="destructive">99+</Badge>
      <Badge variant="outline">∞</Badge>
    </div>
  ),
};
