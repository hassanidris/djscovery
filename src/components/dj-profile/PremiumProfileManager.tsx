"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

import {
  getDjPackages,
  createDjPackage,
  updateDjPackage,
  deleteDjPackage,
} from "@/lib/actions/dj-packages";
import {
  getDjHighlights,
  createDjHighlight,
  updateDjHighlight,
  deleteDjHighlight,
} from "@/lib/actions/dj-highlights";
import {
  getDjEndorsements,
  createDjEndorsement,
  updateDjEndorsement,
  deleteDjEndorsement,
} from "@/lib/actions/dj-endorsements";
import {
  getDjPressItems,
  createDjPressItem,
  updateDjPressItem,
  deleteDjPressItem,
} from "@/lib/actions/dj-press";

type Package = Awaited<ReturnType<typeof getDjPackages>>[number];
type Highlight = Awaited<ReturnType<typeof getDjHighlights>>[number];
type Endorsement = Awaited<ReturnType<typeof getDjEndorsements>>[number];
type PressItem = Awaited<ReturnType<typeof getDjPressItems>>[number];

interface Props {
  djProfileId: number;
  plan: "FREE" | "PREMIUM";
}

function Field({
  label,
  children,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-gray-300">
        {label}
        {optional && (
          <span className="ml-1 text-[11px] text-gray-600">(optional)</span>
        )}
      </Label>
      {children}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-h_blackLight/40 gap-0 border-white/8 p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      <Separator className="mb-5 bg-white/8" />
      {children}
    </Card>
  );
}

export default function PremiumProfileManager({
  djProfileId,
  plan,
}: Props) {
  const isPremium = plan === "PREMIUM";
  const [isPending, startTransition] = useTransition();

  const [packages, setPackages] = useState<Package[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [editPkgId, setEditPkgId] = useState<number | null>(null);
  const [addPkg, setAddPkg] = useState(false);
  const [editHlId, setEditHlId] = useState<number | null>(null);
  const [addHl, setAddHl] = useState(false);
  const [editEndId, setEditEndId] = useState<number | null>(null);
  const [addEnd, setAddEnd] = useState(false);
  const [editPressId, setEditPressId] = useState<number | null>(null);
  const [addPress, setAddPress] = useState(false);

  const loadAll = useCallback(async () => {
    const [p, h, e, pr] = await Promise.all([
      getDjPackages(djProfileId),
      getDjHighlights(djProfileId),
      getDjEndorsements(djProfileId),
      getDjPressItems(djProfileId),
    ]);
    setPackages(p);
    setHighlights(h);
    setEndorsements(e);
    setPressItems(pr);
    setLoaded(true);
  }, [djProfileId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function wrapAction<T extends { error?: string; success?: boolean }>(
    action: () => Promise<T>,
    msg: string,
  ) {
    startTransition(async () => {
      const toastId = toast.loading(msg);
      const res = await action();
      if ("error" in res && res.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success("Saved", { id: toastId });
        await loadAll();
      }
    });
  }

  function handleDelete(
    id: number,
    label: string,
    action: (id: number) => Promise<{ success?: boolean; error?: string }>,
  ) {
    const toastId = toast.loading(`Deleting ${label}...`);
    startTransition(async () => {
      const res = await action(id);
      if ("error" in res && res.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success("Deleted", { id: toastId });
        await loadAll();
      }
    });
  }

  if (!isPremium) {
    return (
      <Section title="Premium Features" subtitle="Unlock these with a Premium plan">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Crown className="h-8 w-8 text-amber-500" />
          <p className="text-sm text-gray-400">
            Upgrade to Premium to manage booking packages, career highlights,
            endorsements, and press items.
          </p>
          <Button
            className="bg-h_red hover:bg-h_redDark mt-2 font-semibold text-white"
            size="sm"
            onClick={() => toast.info("Upgrade flow coming soon")}
          >
            Upgrade to Premium
          </Button>
        </div>
      </Section>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    );
  }

  /* ── Package Form ── */
  function PackageForm({
    item,
    onCancel,
  }: {
    item?: Package;
    onCancel: () => void;
  }) {
    const [name, setName] = useState(item?.name ?? "");
    const [priceFrom, setPriceFrom] = useState(
      item?.priceFrom ? String(item.priceFrom) : "",
    );
    const [priceTo, setPriceTo] = useState(
      item?.priceTo ? String(item.priceTo) : "",
    );
    const [currency, setCurrency] = useState(item?.currency ?? "USD");
    const [duration, setDuration] = useState(item?.duration ?? "");
    const [features, setFeatures] = useState(
      item?.features?.join("\n") ?? "",
    );
    const [popular, setPopular] = useState(item?.popular ?? false);

    function save() {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("priceFrom", priceFrom);
      if (priceTo) fd.append("priceTo", priceTo);
      fd.append("currency", currency);
      if (duration) fd.append("duration", duration);
      fd.append("features", features);
      fd.append("popular", String(popular));

      if (item) {
        wrapAction(() => updateDjPackage(item.id, fd), "Updating package...");
      } else {
        wrapAction(() => createDjPackage(fd), "Creating package...");
      }
      onCancel();
    }

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Club Night" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
          </Field>
          <Field label="Currency">
            <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))} placeholder="USD" maxLength={3} className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
          </Field>
          <Field label="Price From">
            <Input type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="500" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
          </Field>
          <Field label="Price To" optional>
            <Input type="number" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} placeholder="5000" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
          </Field>
          <Field label="Duration" optional>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="4 hours" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
          </Field>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={popular} onCheckedChange={(v) => setPopular(v === true)} className="data-[state=checked]:bg-h_red data-[state=checked]:border-h_red" />
              <span className="text-xs text-gray-300">Most Popular</span>
            </label>
          </div>
        </div>
        <Field label="Features (one per line)" optional>
          <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={`Setup consultation\nCustom setlist\nSocial media promotion`} className="min-h-20 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
        </Field>
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={isPending || !name.trim() || !priceFrom} onClick={save} className="bg-h_red hover:bg-h_redDark text-white">
            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</Button>
        </div>
      </div>
    );
  }

  /* ── Highlight Form ── */
  function HighlightForm({ item, onCancel }: { item?: Highlight; onCancel: () => void }) {
    const [year, setYear] = useState(item?.year ?? "");
    const [title, setTitle] = useState(item?.title ?? "");
    const [description, setDescription] = useState(item?.description ?? "");

    function save() {
      const fd = new FormData();
      fd.append("year", year);
      fd.append("title", title);
      if (description) fd.append("description", description);
      if (item) {
        wrapAction(() => updateDjHighlight(item.id, fd), "Updating highlight...");
      } else {
        wrapAction(() => createDjHighlight(fd), "Creating highlight...");
      }
      onCancel();
    }

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Year"><Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Residency at Fabric London" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
        </div>
        <Field label="Description" optional>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="6-month weekly residency..." className="min-h-16 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
        </Field>
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={isPending || !year.trim() || !title.trim()} onClick={save} className="bg-h_red hover:bg-h_redDark text-white">
            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</Button>
        </div>
      </div>
    );
  }

  /* ── Endorsement Form ── */
  function EndorsementForm({ item, onCancel }: { item?: Endorsement; onCancel: () => void }) {
    const [name, setName] = useState(item?.name ?? "");
    const [role, setRole] = useState(item?.role ?? "");
    const [company, setCompany] = useState(item?.company ?? "");
    const [quote, setQuote] = useState(item?.quote ?? "");
    const [avatar, setAvatar] = useState(item?.avatar ?? "");

    function save() {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("role", role);
      fd.append("quote", quote);
      if (company) fd.append("company", company);
      if (avatar) fd.append("avatar", avatar);
      if (item) {
        wrapAction(() => updateDjEndorsement(item.id, fd), "Updating endorsement...");
      } else {
        wrapAction(() => createDjEndorsement(fd), "Creating endorsement...");
      }
      onCancel();
    }

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marcus Osei" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
          <Field label="Role"><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Music Director" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
          <Field label="Company" optional><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Elite Management" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
          <Field label="Avatar URL" optional><Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
        </div>
        <Field label="Quote">
          <Textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="One of the most exciting DJs..." className="min-h-16 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-600" />
        </Field>
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={isPending || !name.trim() || !role.trim() || !quote.trim()} onClick={save} className="bg-h_red hover:bg-h_redDark text-white">
            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</Button>
        </div>
      </div>
    );
  }

  /* ── Press Form ── */
  function PressForm({ item, onCancel }: { item?: PressItem; onCancel: () => void }) {
    const [source, setSource] = useState(item?.source ?? "");
    const [type, setType] = useState(item?.type ?? "Feature");
    const [title, setTitle] = useState(item?.title ?? "");
    const [date, setDate] = useState(item?.date ?? "");
    const [url, setUrl] = useState(item?.url ?? "");

    function save() {
      const fd = new FormData();
      fd.append("source", source);
      fd.append("type", type);
      fd.append("title", title);
      if (date) fd.append("date", date);
      if (url) fd.append("url", url);
      if (item) {
        wrapAction(() => updateDjPressItem(item.id, fd), "Updating press...");
      } else {
        wrapAction(() => createDjPressItem(fd), "Creating press item...");
      }
      onCancel();
    }

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Source"><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="DJ Mag" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
              {["Feature", "Interview", "Podcast"].map((t) => (
                <option key={t} value={t} className="bg-zinc-900">{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Top 10 Afrobeats DJs" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
          <Field label="Date" optional><Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Sep 2024" className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
          <Field label="URL" optional><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="border-white/10 bg-white/5 text-white placeholder:text-gray-600" /></Field>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={isPending || !source.trim() || !type.trim() || !title.trim()} onClick={save} className="bg-h_red hover:bg-h_redDark text-white">
            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</Button>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="flex flex-col gap-6">
      {/* Packages */}
      <Section title="Booking Packages" subtitle="Tailored options for every event">
        <div className="flex flex-col gap-3">
          {packages.map((pkg) => editPkgId === pkg.id ? (
            <PackageForm key={pkg.id} item={pkg} onCancel={() => setEditPkgId(null)} />
          ) : (
            <div key={pkg.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{pkg.name}</p>
                  {pkg.popular && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">Popular</span>}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{pkg.currency}{pkg.priceFrom}{pkg.priceTo ? ` – ${pkg.priceTo}` : ""}{pkg.duration ? ` · ${pkg.duration}` : ""}</p>
                {pkg.features.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {pkg.features.map((f) => <li key={f} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">{f}</li>)}
                  </ul>
                )}
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setEditPkgId(pkg.id)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-white" aria-label="Edit"><Pencil className="h-3 w-3" /></button>
                <button type="button" onClick={() => handleDelete(pkg.id, "package", deleteDjPackage)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-900/30 hover:text-red-400" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          {addPkg && <PackageForm onCancel={() => setAddPkg(false)} />}
          {!addPkg && <Button type="button" variant="outline" size="sm" onClick={() => setAddPkg(true)} className="w-fit border-white/15 text-gray-400 hover:bg-white/5"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Package</Button>}
        </div>
      </Section>

      {/* Highlights */}
      <Section title="Career Highlights" subtitle="Key milestones and achievements">
        <div className="flex flex-col gap-3">
          {highlights.map((h) => editHlId === h.id ? (
            <HighlightForm key={h.id} item={h} onCancel={() => setEditHlId(null)} />
          ) : (
            <div key={h.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{h.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{h.year}</p>
                {h.description && <p className="mt-1 text-xs text-gray-400">{h.description}</p>}
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setEditHlId(h.id)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-white" aria-label="Edit"><Pencil className="h-3 w-3" /></button>
                <button type="button" onClick={() => handleDelete(h.id, "highlight", deleteDjHighlight)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-900/30 hover:text-red-400" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          {addHl && <HighlightForm onCancel={() => setAddHl(false)} />}
          {!addHl && <Button type="button" variant="outline" size="sm" onClick={() => setAddHl(true)} className="w-fit border-white/15 text-gray-400 hover:bg-white/5"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Highlight</Button>}
        </div>
      </Section>

      {/* Endorsements */}
      <Section title="Industry Endorsements" subtitle="What industry professionals say">
        <div className="flex flex-col gap-3">
          {endorsements.map((e) => editEndId === e.id ? (
            <EndorsementForm key={e.id} item={e} onCancel={() => setEditEndId(null)} />
          ) : (
            <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{e.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">{e.role}{e.company ? `, ${e.company}` : ""}</p>
                <p className="mt-2 text-sm italic text-gray-300">&ldquo;{e.quote}&rdquo;</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setEditEndId(e.id)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-white" aria-label="Edit"><Pencil className="h-3 w-3" /></button>
                <button type="button" onClick={() => handleDelete(e.id, "endorsement", deleteDjEndorsement)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-900/30 hover:text-red-400" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          {addEnd && <EndorsementForm onCancel={() => setAddEnd(false)} />}
          {!addEnd && <Button type="button" variant="outline" size="sm" onClick={() => setAddEnd(true)} className="w-fit border-white/15 text-gray-400 hover:bg-white/5"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Endorsement</Button>}
        </div>
      </Section>

      {/* Press */}
      <Section title="Press & Media" subtitle="Interviews, features, and podcasts">
        <div className="flex flex-col gap-3">
          {pressItems.map((p) => editPressId === p.id ? (
            <PressForm key={p.id} item={p} onCancel={() => setEditPressId(null)} />
          ) : (
            <div key={p.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/3 p-4">
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="text-h_red text-xs font-bold">{p.source}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">{p.type}</span>
                </div>
                <p className="text-sm font-medium text-white">{p.title}</p>
                {p.date && <p className="mt-0.5 text-xs text-gray-600">{p.date}</p>}
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-h_red underline">Read article →</a>}
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setEditPressId(p.id)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-white" aria-label="Edit"><Pencil className="h-3 w-3" /></button>
                <button type="button" onClick={() => handleDelete(p.id, "press item", deleteDjPressItem)} className="flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-900/30 hover:text-red-400" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          {addPress && <PressForm onCancel={() => setAddPress(false)} />}
          {!addPress && <Button type="button" variant="outline" size="sm" onClick={() => setAddPress(true)} className="w-fit border-white/15 text-gray-400 hover:bg-white/5"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Press Item</Button>}
        </div>
      </Section>
    </div>
  );
}
