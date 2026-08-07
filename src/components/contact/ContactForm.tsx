"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactForm } from "@/lib/actions/contact";
import {
  CONTACT_CATEGORIES,
  type ContactFormState,
} from "@/lib/actions/contact.constants";

const initialState: ContactFormState = { success: false };

export function ContactForm({
  defaultName = "",
  defaultEmail = "",
  defaultCategory = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultCategory?: string;
}) {
  const [state, action, pending] = useActionState(
    submitContactForm,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/2 px-8 py-16 text-center">
        <div className="bg-h_red/10 border-h_red/20 flex size-16 items-center justify-center rounded-2xl border">
          <CheckCircle2 className="text-h_redLight h-8 w-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl text-white">Message sent!</h2>
          <p className="max-w-sm text-sm leading-relaxed text-gray-400">
            We&apos;ve received your message and will get back to you within 1–2
            business days. Check your inbox for a confirmation email.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-h_redLight text-sm font-medium underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-6">
      {state.message && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{state.message}</p>
        </div>
      )}

      {/* Honeypot — hidden from real users, catches bots */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-full opacity-0"
      />

      {/* Name + Email row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">
            Full name <span className="text-h_redLight">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            defaultValue={defaultName}
            autoComplete="name"
            aria-describedby={state.errors?.name ? "name-error" : undefined}
            aria-invalid={!!state.errors?.name}
            className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
          {state.errors?.name && (
            <p id="name-error" className="text-xs text-red-400">
              {state.errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            Email address <span className="text-h_redLight">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={defaultEmail}
            autoComplete="email"
            aria-describedby={state.errors?.email ? "email-error" : undefined}
            aria-invalid={!!state.errors?.email}
            className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
          {state.errors?.email && (
            <p id="email-error" className="text-xs text-red-400">
              {state.errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="category">
          Category <span className="text-h_redLight">*</span>
        </Label>
        <select
          id="category"
          name="category"
          defaultValue={defaultCategory}
          aria-describedby={
            state.errors?.category ? "category-error" : undefined
          }
          aria-invalid={!!state.errors?.category}
          className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white transition-colors outline-none focus-visible:ring-2"
        >
          <option value="" disabled className="bg-neutral-900 text-white/60">
            Select a category
          </option>
          {CONTACT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-neutral-900 text-white">
              {cat}
            </option>
          ))}
        </select>
        {state.errors?.category && (
          <p id="category-error" className="text-xs text-red-400">
            {state.errors.category}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">
          Message <span className="text-h_redLight">*</span>
        </Label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell us how we can help you…"
          aria-describedby={state.errors?.message ? "message-error" : undefined}
          aria-invalid={!!state.errors?.message}
          className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus-visible:ring-2"
        />
        {state.errors?.message && (
          <p id="message-error" className="text-xs text-red-400">
            {state.errors.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400">
          We typically reply within 1–2 business days.
        </p>
        <Button
          type="submit"
          disabled={pending}
          className="bg-h_red hover:bg-h_red/80 shrink-0 gap-2 text-white"
          size="lg"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
