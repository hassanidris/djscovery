import type { Meta, StoryObj } from "@storybook/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-muted-foreground text-sm">
          Make changes to your account here. Click save when you&apos;re done.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-muted-foreground text-sm">
          Change your password here. After saving, you&apos;ll be logged out.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-muted-foreground text-sm">
          Overview of your dashboard and key metrics.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-muted-foreground text-sm">
          Detailed analytics and performance data.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-muted-foreground text-sm">
          Generate and view various reports.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="mail">
      <TabsList>
        <TabsTrigger value="mail">Mail</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
      </TabsList>
      <TabsContent value="mail">
        <p className="text-muted-foreground text-sm">
          Manage your emails and messages.
        </p>
      </TabsContent>
      <TabsContent value="calendar">
        <p className="text-muted-foreground text-sm">
          View and manage your calendar events.
        </p>
      </TabsContent>
      <TabsContent value="contacts">
        <p className="text-muted-foreground text-sm">
          Your contacts and address book.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tabs defaultValue="profile" orientation="vertical">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <p className="text-muted-foreground text-sm">
            Update your profile information and preferences.
          </p>
        </TabsContent>
        <TabsContent value="billing">
          <p className="text-muted-foreground text-sm">
            Manage your billing information and payment methods.
          </p>
        </TabsContent>
        <TabsContent value="notifications">
          <p className="text-muted-foreground text-sm">
            Configure your notification preferences.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const NoDefaultValue: Story = {
  render: () => (
    <Tabs>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-muted-foreground text-sm">Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-muted-foreground text-sm">Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-muted-foreground text-sm">Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};
