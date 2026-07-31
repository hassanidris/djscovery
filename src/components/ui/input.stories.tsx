import type { Meta, StoryObj } from "@storybook/nextjs";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@example.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
  },
};

export const Disabled: Story = {
  args: {
    type: "text",
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    type: "text",
    defaultValue: "Pre-filled value",
  },
};

export const Invalid: Story = {
  args: {
    type: "text",
    placeholder: "Invalid input",
    "aria-invalid": true,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone input" />
      <Input type="url" placeholder="URL input" />
      <Input type="search" placeholder="Search input" />
    </div>
  ),
};
