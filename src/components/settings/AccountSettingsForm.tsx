"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Mail, KeyRound, AlertTriangle, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { updatePassword } from "@/lib/actions/account";

interface Props {
  currentEmail: string;
}

export default function AccountSettingsForm({ currentEmail }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwPending, startPwTransition] = useTransition();

  function handlePasswordSave() {
    startPwTransition(async () => {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("confirm", confirm);
      const result = await updatePassword(fd);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password updated.");
        setPassword("");
        setConfirm("");
      }
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Email — read-only */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Mail className="h-4 w-4" />
            Email Address
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Your login email cannot be changed.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
          <Lock className="h-3.5 w-3.5 shrink-0 text-gray-600" />
          <span className="text-sm text-gray-300">{currentEmail}</span>
        </div>
      </section>

      <Separator className="bg-white/8" />

      {/* Password */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <KeyRound className="h-4 w-4" />
            Password
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Change your password. Must be at least 8 characters.
          </p>
        </div>
        <div className="flex flex-col gap-4">
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
            type="button"
            onClick={handlePasswordSave}
            disabled={pwPending || !password || !confirm}
          >
            {pwPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pwPending ? "Saving..." : "Update Password"}
          </Button>
        </div>
      </section>

      <Separator className="bg-white/8" />

      {/* Danger Zone */}
      <section className="flex flex-col gap-5">
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" type="button">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your DJcovery account, profile,
                    and all your data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      toast.info(
                        "Account deletion coming soon. Please contact support.",
                      );
                    }}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    </div>
  );
}
