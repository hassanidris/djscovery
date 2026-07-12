"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  KeyRound,
  AlertTriangle,
  Loader2,
  Shield,
  Trash2,
  Bell,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updatePassword,
  deleteAccount,
  updateDjEmailPreferences,
} from "@/lib/actions/account";

export type DjAccountFormProps = {
  email: string;
  identities: { provider: string; identity_id?: string }[];
  preferences: {
    bookingEmails: boolean;
    gigEmails: boolean;
    applicationEmails: boolean;
    platformUpdates: boolean;
    marketingEmails: boolean;
  } | null;
};

export default function DjAccountForm({
  email,
  identities,
  preferences,
}: DjAccountFormProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-10">
      <EmailSection currentEmail={email} />
      <Separator className="bg-white/8" />
      <PasswordSection />
      <Separator className="bg-white/8" />
      <LinkedAccountsSection identities={identities} />
      <Separator className="bg-white/8" />
      <NotificationsSection preferences={preferences} />
      <Separator className="bg-white/8" />
      <DangerZoneSection />
    </div>
  );
}

// ─── Email Section ───────────────────────────────────────────────────────────

function EmailSection({ currentEmail }: { currentEmail: string }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Mail className="h-4 w-4" />
          Email Address
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Your login email cannot be changed.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
        <Mail className="h-3.5 w-3.5 shrink-0 text-gray-600" />
        <span className="text-sm text-gray-300">{currentEmail}</span>
      </div>
    </section>
  );
}

// ─── Password Section ────────────────────────────────────────────────────────

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("currentPassword", currentPassword);
      fd.append("password", password);
      fd.append("confirm", confirm);
      const result = await updatePassword(fd);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Password updated.");
        setCurrentPassword("");
        setPassword("");
        setConfirm("");
      }
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <KeyRound className="h-4 w-4" />
          Password
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Change your password. Must be at least 8 characters.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending || !currentPassword || !password || !confirm}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Update Password"}
        </Button>
      </div>
    </section>
  );
}

// ─── Linked Accounts Section ─────────────────────────────────────────────────

const PROVIDER_ICONS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  facebook: "Facebook",
  apple: "Apple",
};

function LinkedAccountsSection({
  identities,
}: {
  identities: { provider: string; identity_id?: string }[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Shield className="h-4 w-4" />
          Linked Accounts
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Social accounts you use to sign in.
        </p>
      </div>
      {identities.length === 0 ? (
        <p className="text-sm text-gray-500">No linked social accounts.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {identities.map((identity) => (
            <div
              key={identity.identity_id ?? identity.provider}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="text-sm text-white capitalize">
                {PROVIDER_ICONS[identity.provider] ?? identity.provider}
              </span>
              <span className="text-xs text-gray-500">Connected</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Notifications Section ───────────────────────────────────────────────────

function NotificationsSection({
  preferences,
}: {
  preferences: DjAccountFormProps["preferences"];
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({
    bookingEmails: preferences?.bookingEmails ?? true,
    gigEmails: preferences?.gigEmails ?? true,
    applicationEmails: preferences?.applicationEmails ?? true,
    platformUpdates: preferences?.platformUpdates ?? true,
    marketingEmails: preferences?.marketingEmails ?? false,
  });

  function toggle(key: keyof typeof state) {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(state).forEach(([key, value]) => {
        fd.append(key, value ? "on" : "off");
      });
      const result = await updateDjEmailPreferences(fd);
      if (result.error) toast.error(result.error);
      else toast.success("Notification preferences saved.");
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Bell className="h-4 w-4" />
          Notifications
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Choose which emails you want to receive.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {(
          [
            ["bookingEmails", "Booking inquiries"],
            ["gigEmails", "Gig updates"],
            ["applicationEmails", "Application updates"],
            ["platformUpdates", "Platform updates"],
            ["marketingEmails", "Marketing & tips"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <Label
              htmlFor={key}
              className="cursor-pointer text-sm text-gray-300"
            >
              {label}
            </Label>
            <Switch
              id={key}
              checked={state[key]}
              onCheckedChange={() => toggle(key)}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </section>
  );
}

// ─── Danger Zone Section ─────────────────────────────────────────────────────

function DangerZoneSection() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("confirmation", confirmation);
      const result = await deleteAccount(fd);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Account deleted.");
        router.push("/");
      }
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-red-400">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          These actions are permanent and cannot be undone.
        </p>
      </div>
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Delete Account</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Permanently delete your account, DJ profile, and all associated
              data.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" type="button">
                <Trash2 className="mr-1 h-4 w-4" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-h_black border-white/10 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This will permanently delete your DJcovery account, DJ
                  profile, and all your data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-2 py-2">
                <Label htmlFor="confirm-delete">
                  Type <strong>DELETE</strong> to confirm
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="border-white/10 bg-white/5"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isPending || confirmation !== "DELETE"}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  );
}
