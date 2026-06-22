"use client";

import { useTransition } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionResult = { success: true } | { error: string };

type Props = {
  label: string;
  description: string;
  confirmLabel?: string;
  fields: Record<string, string>;
  action: (formData: FormData) => Promise<ActionResult>;
  successMessage: string;
  variant?: "destructive" | "ghost" | "outline";
  className?: string;
  requireConfirm?: boolean;
};

export default function AdminActionButton({
  label,
  description,
  confirmLabel = "Confirm",
  fields,
  action,
  successMessage,
  variant = "ghost",
  className,
  requireConfirm = true,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function execute() {
    if (isPending) return;
    startTransition(async () => {
      try {
        const fd = new FormData();
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
        const result = await action(fd);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success(successMessage);
      } catch {
        toast.error("Action failed. Please try again.");
      }
    });
  }

  if (!requireConfirm) {
    return (
      <Button
        variant={variant}
        size="sm"
        disabled={isPending}
        onClick={execute}
        className={cn("h-7 text-xs", className)}
      >
        {isPending ? "..." : label}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          disabled={isPending}
          className={cn("h-7 text-xs", className)}
        >
          {isPending ? "..." : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-white/10 bg-zinc-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{label}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={execute}
            disabled={isPending}
            className="bg-h_red hover:bg-h_red/80 text-white"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
