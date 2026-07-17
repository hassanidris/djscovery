"use client";

import { useState, useTransition } from "react";
import { Lock, KeyRound, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { updatePassword, deleteAccount } from "@/lib/actions/account";
import { useRouter } from "next/navigation";

export default function AccountSettingsForm({
  currentEmail,
}: {
  currentEmail: string;
}) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwPending, startPwTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Lock className="h-4 w-4" />
            Email Address
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Your login email cannot be changed.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
          <Lock className="h-3.5 w-3.5 shrink-0 text-gray-600" />
          <span className="text-sm text-gray-300">{currentEmail}</span>
        </div>
      </section>

      <Separator className="bg-white/8" />

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <KeyRound className="h-4 w-4" />
            Password
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
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
            type="button"
            disabled={pwPending || !currentPassword || !password || !confirm}
            onClick={() => {
              startPwTransition(async () => {
                const fd = new FormData();
                fd.append("currentPassword", currentPassword);
                fd.append("password", password);
                fd.append("confirm", confirm);
                const result = await updatePassword(fd);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Password updated.");
                  setCurrentPassword("");
                  setPassword("");
                  setConfirm("");
                }
              });
            }}
          >
            {pwPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {pwPending ? "Saving..." : "Update Password"}
          </Button>
        </div>
      </section>

      <Separator className="bg-white/8" />

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            These actions are permanent and cannot be undone.
          </p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" type="button">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-h_black border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This will permanently delete your DJcovery account, profile,
                    and all your data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-2 py-2">
                  <Label htmlFor="confirm-delete">
                    Type <strong>DELETE</strong> to confirm
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      startDeleteTransition(async () => {
                        const fd = new FormData();
                        fd.append("confirmation", deleteConfirmation);
                        const result = await deleteAccount(fd);
                        if (result.error) {
                          toast.error(result.error);
                        } else {
                          toast.success("Account deleted.");
                          router.push("/");
                        }
                      });
                    }}
                    disabled={deletePending || deleteConfirmation !== "DELETE"}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deletePending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
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
