import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            Your profile information will be updated across the platform.
          </p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  args: {
    open: true,
  },
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Quick access to main sections</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 py-4">
          <Button variant="ghost" className="w-full justify-start">
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  args: {
    open: true,
  },
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>You have 3 new messages</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 py-4">
          <div className="text-sm">New message from John</div>
          <div className="text-sm">Your event was approved</div>
          <div className="text-sm">Welcome to the platform!</div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  args: {
    open: true,
  },
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Mobile Menu</SheetTitle>
        </SheetHeader>
        <div className="space-y-2 py-4">
          <Button variant="ghost" className="w-full justify-start">
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Search
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Profile
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const WithoutCloseButton: Story = {
  args: {
    open: true,
  },
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="right" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Important</SheetTitle>
          <SheetDescription>
            This sheet cannot be closed manually
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            Complete the required action to proceed.
          </p>
        </div>
        <SheetFooter>
          <Button>Continue</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const WithTrigger: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet with Trigger</SheetTitle>
          <SheetDescription>
            This sheet is opened by clicking the trigger button.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            Sheet content goes here.
          </p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Confirm</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
