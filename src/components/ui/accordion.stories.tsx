import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger>Can I use it in my project?</AccordionTrigger>
        <AccordionContent>
          Yes. Free for personal and commercial use. No attribution required.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it customizable?</AccordionTrigger>
        <AccordionContent>
          Yes. You can customize the colors, fonts, and other properties.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Does it support TypeScript?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s built with TypeScript and includes type definitions.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithoutCollapsible: Story = {
  render: () => (
    <Accordion type="single" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>Can I collapse it?</AccordionTrigger>
        <AccordionContent>
          No. This accordion doesn&apos;t allow collapsing the active item.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What about this one?</AccordionTrigger>
        <AccordionContent>
          This one also doesn&apos;t collapse the active item.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const LongContent: Story = {
  args: {
    defaultValue: "item-1",
  },
  render: () => (
    <Accordion type="single" defaultValue="item-1" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is the project about?</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">
            This project is a comprehensive web application built with modern
            technologies. It includes features like user authentication, data
            management, and real-time updates.
          </p>
          <p>
            The architecture is designed to be scalable and maintainable, with a
            focus on performance and user experience.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How does it work?</AccordionTrigger>
        <AccordionContent>
          The application uses a client-server architecture with a React
          frontend and a Node.js backend. Data is stored in a PostgreSQL
          database and served through a RESTful API.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithLinks: Story = {
  args: {
    defaultValue: "item-1",
  },
  render: () => (
    <Accordion type="single" defaultValue="item-1" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Resources</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <a href="#" className="text-foreground hover:underline">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground hover:underline">
                API Reference
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground hover:underline">
                Community Forum
              </a>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Support</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">Need help? Check out our support channels:</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <a href="#" className="text-foreground hover:underline">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground hover:underline">
                Contact Support
              </a>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const AllCollapsed: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>Content for the first item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>Content for the second item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Item</AccordionTrigger>
        <AccordionContent>Content for the third item.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
