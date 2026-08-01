import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="option1">
      <SelectTrigger aria-label="Select an option">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Choose a framework">
        <SelectValue placeholder="Choose a framework" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="next">Next.js</SelectItem>
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
        <SelectItem value="svelte">Svelte</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger aria-label="Disabled select">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Select defaultValue="option1">
      <SelectTrigger size="sm" aria-label="Small select">
        <SelectValue placeholder="Small select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="select-with-label"
        className="text-foreground text-sm font-medium"
      >
        Select with Label
      </label>
      <Select defaultValue="option1">
        <SelectTrigger id="select-with-label">
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const LongOptions: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a country">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us">United States of America</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="au">Australia</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="jp">Japan</SelectItem>
      </SelectContent>
    </Select>
  ),
};
