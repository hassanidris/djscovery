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
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="default-input">Default Input</label>
      <Input id="default-input" {...args} />
    </div>
  ),
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@example.com",
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="email-input">Email Input</label>
      <Input id="email-input" {...args} />
    </div>
  ),
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="password-input">Password Input</label>
      <Input id="password-input" {...args} />
    </div>
  ),
};

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="number-input">Number Input</label>
      <Input id="number-input" {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    type: "text",
    placeholder: "Disabled input",
    disabled: true,
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="disabled-input">Disabled Input</label>
      <Input id="disabled-input" {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    type: "text",
    defaultValue: "Pre-filled value",
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="value-input">Input with Value</label>
      <Input id="value-input" {...args} />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    type: "text",
    placeholder: "Invalid input",
    "aria-invalid": true,
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="invalid-input">Invalid Input</label>
      <Input id="invalid-input" {...args} />
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="all-text">Text Input</label>
        <Input id="all-text" type="text" placeholder="Text input" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="all-email">Email Input</label>
        <Input id="all-email" type="email" placeholder="Email input" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="all-password">Password Input</label>
        <Input id="all-password" type="password" placeholder="Password input" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="all-number">Number Input</label>
        <Input id="all-number" type="number" placeholder="Number input" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="all-tel">Phone Input</label>
        <Input id="all-tel" type="tel" placeholder="Phone input" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="all-url">URL Input</label>
        <Input id="all-url" type="url" placeholder="URL input" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="all-search">Search Input</label>
        <Input id="all-search" type="search" placeholder="Search input" />
      </div>
    </div>
  ),
};
