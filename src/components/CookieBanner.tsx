"use client";

import { useEffect, useState } from "react";
import {
  CookieIcon,
  Settings2Icon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CONSENT_CATEGORIES,
  type CookieConsent,
  type ConsentCategory,
  acceptAll,
  rejectNonEssential,
  getStoredConsent,
  saveConsent,
} from "@/lib/cookies/consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Omit<CookieConsent, "updatedAt">>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    } else {
      setPrefs({
        necessary: true,
        analytics: stored.analytics,
        marketing: stored.marketing,
        preferences: stored.preferences,
      });
    }
  }, []);

  function handleAcceptAll() {
    acceptAll();
    setVisible(false);
    setPrefsOpen(false);
  }

  function handleRejectNonEssential() {
    rejectNonEssential();
    setPrefs({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
    setVisible(false);
    setPrefsOpen(false);
  }

  function handleSavePreferences() {
    saveConsent(prefs);
    setVisible(false);
    setPrefsOpen(false);
  }

  function toggleCategory(key: ConsentCategory, value: boolean) {
    if (key === "necessary") return;
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="false"
        className="fixed right-0 bottom-0 left-0 z-60 border-t border-white/10 bg-zinc-950/95 backdrop-blur-md md:right-auto md:bottom-6 md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:rounded-xl md:border md:border-white/10 md:shadow-2xl"
      >
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <CookieIcon className="size-4 text-white/70" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug font-medium text-white">
                DJcovery uses cookies
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                DJcovery uses cookies and similar technologies to personalise
                content, analyse traffic, and improve your experience. You can
                accept all, reject non-essential, or manage your preferences.{" "}
                <a
                  href="/privacy-policy"
                  className="underline underline-offset-2 transition-colors hover:text-white/80"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center gap-2 text-white/60 hover:text-white sm:w-auto"
              onClick={() => setPrefsOpen(true)}
            >
              <Settings2Icon className="size-3.5" />
              Manage Preferences
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center border-white/15 bg-transparent text-white/80 hover:bg-white/5 hover:text-white sm:w-auto"
              onClick={handleRejectNonEssential}
            >
              Reject Non-Essential
            </Button>
            <Button
              size="sm"
              className="w-full justify-center gap-2 sm:w-auto"
              onClick={handleAcceptAll}
            >
              <ShieldCheckIcon className="size-3.5" />
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Settings2Icon className="size-4 text-white/60" />
                Cookie Preferences
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPrefsOpen(false)}
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <DialogDescription>
              Choose which cookies you allow. Strictly necessary cookies are
              always active as they are required for the site to work.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col divide-y divide-white/8">
            {CONSENT_CATEGORIES.map(({ key, label, description, required }) => (
              <div
                key={key}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm leading-snug font-medium">
                    {label}
                    {required && (
                      <span className="ml-2 rounded-sm bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/50 uppercase">
                        Required
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {description}
                  </p>
                </div>
                <Switch
                  checked={prefs[key as ConsentCategory]}
                  disabled={required}
                  onCheckedChange={(val) =>
                    toggleCategory(key as ConsentCategory, val)
                  }
                  aria-label={`Toggle ${label} cookies`}
                  className="mt-0.5 shrink-0"
                />
              </div>
            ))}
          </div>

          <DialogFooter className="bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white"
              onClick={handleRejectNonEssential}
            >
              Reject Non-Essential
            </Button>
            <Button size="sm" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
