"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CONTACT, KITS, QUOTE_SLA, mailtoLink, whatsappLink } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export type QuoteType = "B2B" | "B2C";

/** Options that change with who's asking: a business (B2B) or an individual (B2C). */
const BY_TYPE = {
  B2B: {
    tag: "B2B",
    label: "For a business",
    sub: "Brand kits, bulk & repeat orders",
    needsTitle: "Which kits or products does your brand need?",
    needs: [...KITS, "Something else"],
    quantities: ["Under 100", "100 – 500", "500 – 1,000", "1,000+", "Not sure yet"],
    extraLabel: "Order type",
    extras: ["One-time order", "Monthly / repeat", "Ongoing for all outlets"],
    detailsPlaceholder: "e.g. 500 visiting cards, matte with spot UV logo + 50 staff tees",
    emailPlaceholder: "you@company.com",
  },
  B2C: {
    tag: "B2C",
    label: "For myself",
    sub: "One-off & small custom prints",
    needsTitle: "What would you like printed?",
    needs: [
      "T-shirts & apparel",
      "Caps",
      "Bags & totes",
      "Mugs & bottles",
      "Posters & photo prints",
      "Stickers & labels",
      "Notebooks & stationery",
      "Something else",
    ],
    quantities: ["Just 1", "2 – 10", "10 – 50", "50+"],
    extraLabel: "Your design",
    extras: ["Ready to print", "I have a photo / idea", "Need help designing"],
    detailsPlaceholder: "e.g. 1 black tee, size L, my own artwork on the back",
    emailPlaceholder: "you@email.com",
  },
} as const;

const TIMELINES = ["This week", "In 2 weeks", "This month", "Flexible"];
const REPLY_VIA = ["WhatsApp", "Email", "Call"];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

interface FormState {
  type: QuoteType;
  needs: string[];
  quantity: string;
  timeline: string;
  extra: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  details: string;
  replyVia: string;
}

const EMPTY: FormState = {
  type: "B2B",
  needs: [],
  quantity: "",
  timeline: "",
  extra: "",
  name: "",
  business: "",
  phone: "",
  email: "",
  details: "",
  replyVia: "WhatsApp",
};

/** Indian mobile numbers: 10 digits, optionally prefixed with +91 / 0. */
const validPhone = (v: string) => /^(\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""));
const validEmail = (v: string) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function buildMessage(f: FormState) {
  const lines: (string | null)[] = [
    "Hi Sonic Prints! I'd like a quote.",
    `Type: ${f.type === "B2B" ? "B2B — for a business" : "B2C — personal order"}`,
    "",
    `Name: ${f.name}`,
    f.business ? `Business: ${f.business}` : null,
    `Phone: ${f.phone}`,
    f.email ? `Email: ${f.email}` : null,
    "",
    `Need: ${f.needs.length ? f.needs.join(", ") : "Not sure yet"}`,
    f.quantity ? `Quantity: ${f.quantity}` : null,
    f.timeline ? `Needed: ${f.timeline}` : null,
    f.extra ? `${BY_TYPE[f.type].extraLabel}: ${f.extra}` : null,
    f.details ? `Details: ${f.details}` : null,
    "",
    `Please reply via ${f.replyVia}.`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-2 text-sm transition-[background-color,border-color,color,transform] duration-300 active:scale-95 ${
        selected ? "border-ink bg-ink text-cream" : "border-ink/15 bg-white text-ink/80 hover:border-ink/50"
      }`}
    >
      {selected && <span aria-hidden="true" className="mr-1.5 text-accent">✓</span>}
      {children}
    </button>
  );
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-ink/45">{hint}</span>}
      </span>
      {children}
      <span className={`block overflow-hidden text-xs text-accent transition-[max-height,opacity] duration-300 ${error ? "mt-1 max-h-6 opacity-100" : "max-h-0 opacity-0"}`}>
        {error}
      </span>
    </label>
  );
}

const inputClass = (invalid?: boolean) =>
  `w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 outline-none transition-[border-color,box-shadow] duration-300 focus:border-ink focus:shadow-[0_0_0_4px_rgba(189,85,1,0.15)] ${
    invalid ? "border-accent" : "border-ink/15"
  }`;

function Group({ title, step, children }: { title: string; step: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-ink/10 pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-4 flex items-center gap-3 text-sm font-semibold text-ink">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent font-mono text-[11px] text-cream">{step}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function QuoteForm({ initialNeeds = [], initialType = "B2B" }: { initialNeeds?: string[]; initialType?: QuoteType }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, type: initialType, needs: initialNeeds });
  const opts = BY_TYPE[form.type];
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState<null | "WhatsApp" | "email">(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleNeed = (need: string) =>
    set("needs", form.needs.includes(need) ? form.needs.filter((n) => n !== need) : [...form.needs, need]);

  // Switching audience swaps the product options, so clear choices that no longer apply; contact details stay.
  const setType = (type: QuoteType) =>
    setForm((f) => (f.type === type ? f : { ...f, type, needs: [], quantity: "", extra: "", business: type === "B2C" ? "" : f.business }));

  const errors = {
    business: form.type === "B2C" || form.business.trim() ? "" : "Please add your company or brand name.",
    name: form.name.trim() ? "" : "Please tell us your name.",
    phone: validPhone(form.phone) ? "" : "Enter a 10-digit mobile number.",
    email: validEmail(form.email.trim()) ? "" : "That email doesn't look right.",
  };
  const valid = !errors.business && !errors.name && !errors.phone && !errors.email;

  const send = (via: "WhatsApp" | "email") => {
    setTouched(true);
    if (!valid) return;
    const message = buildMessage(form);
    if (via === "WhatsApp") window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    else window.location.href = mailtoLink(`${form.type} quote request — ${form.business || form.name}`, message);
    setSent(via);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send("WhatsApp");
  };

  if (sent) {
    return (
      <div className="relative overflow-hidden rounded-[32px] bg-white p-8 text-center shadow-[0_40px_80px_-40px_rgba(0,20,8,0.35)] sm:p-12" role="status">
        <svg viewBox="0 0 80 80" className="mx-auto h-20 w-20" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#bd5501" strokeWidth="4" strokeDasharray="227" strokeDashoffset="227" className="animate-[quote-draw_0.9s_ease-out_forwards]" />
          <path d="M25 41 l10 10 l20 -22" fill="none" stroke="#001408" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" className="animate-[quote-draw_0.5s_ease-out_0.7s_forwards]" />
        </svg>
        <h3 className="mt-6 text-3xl font-extrabold tracking-[-0.03em] text-ink">Request ready to send.</h3>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink/70">
          {sent === "WhatsApp"
            ? "We've opened WhatsApp with your details filled in — just hit send. Got a logo or reference? Attach it in the same chat."
            : "We've opened your email app with your details filled in — just hit send. You can attach your logo or references there."}{" "}
          INKA will reply within {QUOTE_SLA}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => send(sent)} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent">
            Didn&apos;t open? Try again
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(null);
              setForm({ ...EMPTY, type: form.type });
              setTouched(false);
            }}
            className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            New request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative space-y-6 rounded-[32px] bg-white/90 p-6 shadow-[0_40px_80px_-40px_rgba(0,20,8,0.35)] ring-1 ring-ink/5 backdrop-blur-xl sm:p-9"
    >
      <div>
        <p className="mb-3 text-sm font-semibold text-ink">Who is this for?</p>
        <div role="radiogroup" aria-label="Quote type" className="relative grid grid-cols-2 gap-1 rounded-[22px] bg-ink/[0.05] p-1">
          <span
            aria-hidden="true"
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-[18px] bg-ink shadow-[0_10px_24px_-12px_rgba(0,20,8,0.6)] transition-transform duration-500 ${EASE} ${
              form.type === "B2C" ? "translate-x-[calc(100%+4px)]" : ""
            }`}
          />
          {(["B2B", "B2C"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={form.type === t}
              onClick={() => setType(t)}
              className={`relative z-10 rounded-[18px] px-3 py-3 text-left transition-colors duration-300 sm:px-4 ${form.type === t ? "text-cream" : "text-ink/70 hover:text-ink"}`}
            >
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest transition-colors duration-300 ${
                    form.type === t ? "bg-accent text-cream" : "bg-accent/10 text-accent"
                  }`}
                >
                  {BY_TYPE[t].tag}
                </span>
                {BY_TYPE[t].label}
              </span>
              <span className={`mt-1 block text-xs ${form.type === t ? "text-cream/65" : "text-ink/50"}`}>{BY_TYPE[t].sub}</span>
            </button>
          ))}
        </div>
      </div>

      <Group step="1" title={opts.needsTitle}>
        <div key={form.type} className="flex flex-wrap gap-2 motion-safe:animate-[kit-in_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          {opts.needs.map((n) => (
            <Chip key={n} selected={form.needs.includes(n)} onClick={() => toggleNeed(n)}>
              {n}
            </Chip>
          ))}
        </div>
      </Group>

      <Group step="2" title="How many, and by when?">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-ink/55">Quantity</p>
            <div key={form.type} className="flex flex-wrap gap-2 motion-safe:animate-[kit-in_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
              {opts.quantities.map((q) => (
                <Chip key={q} selected={form.quantity === q} onClick={() => set("quantity", form.quantity === q ? "" : q)}>
                  {q}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-ink/55">Needed</p>
            <div className="flex flex-wrap gap-2">
              {TIMELINES.map((t) => (
                <Chip key={t} selected={form.timeline === t} onClick={() => set("timeline", form.timeline === t ? "" : t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs text-ink/55">{opts.extraLabel}</p>
            <div key={form.type} className="flex flex-wrap gap-2 motion-safe:animate-[kit-in_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
              {opts.extras.map((x) => (
                <Chip key={x} selected={form.extra === x} onClick={() => set("extra", form.extra === x ? "" : x)}>
                  {x}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Group>

      <Group step="3" title="Your details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={touched ? errors.name : ""}>
            <input className={inputClass(touched && !!errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" placeholder="Your name" />
          </Field>
          {form.type === "B2B" && (
            <Field label="Company / brand" error={touched ? errors.business : ""}>
              <input
                className={inputClass(touched && !!errors.business)}
                value={form.business}
                onChange={(e) => set("business", e.target.value)}
                autoComplete="organization"
                placeholder="Brand or company"
              />
            </Field>
          )}
          <Field label="Mobile / WhatsApp" error={touched ? errors.phone : ""}>
            <input
              className={inputClass(touched && !!errors.phone)}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="98765 43210"
            />
          </Field>
          <Field label={form.type === "B2B" ? "Work email" : "Email"} hint="Optional" error={touched ? errors.email : ""}>
            <input
              className={inputClass(touched && !!errors.email)}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              type="email"
              autoComplete="email"
              placeholder={opts.emailPlaceholder}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Anything else?" hint="Sizes, finish, colours, references">
              <textarea
                className={`${inputClass()} min-h-28 resize-y`}
                value={form.details}
                onChange={(e) => set("details", e.target.value)}
                placeholder={opts.detailsPlaceholder}
              />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-ink/55">Reply via</span>
          {REPLY_VIA.map((r) => (
            <Chip key={r} selected={form.replyVia === r} onClick={() => set("replyVia", r)}>
              {r}
            </Chip>
          ))}
        </div>
      </Group>

      <div className="flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="group relative inline-flex items-center justify-between gap-4 overflow-hidden rounded-full bg-ink py-2 pr-2 pl-6 font-medium text-cream sm:justify-start"
        >
          <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ${EASE} group-hover:translate-y-0`} />
          <span className="relative">Send on WhatsApp</span>
          <span aria-hidden="true" className={`relative grid h-10 w-10 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>
            →
          </span>
        </button>
        <button type="button" onClick={() => send("email")} className="rounded-full px-5 py-3 text-sm font-medium text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink hover:decoration-accent">
          or send by email
        </button>
      </div>
      <p className="text-xs leading-relaxed text-ink/50">
        Opens WhatsApp ({CONTACT.phone}) or your email app with your details filled in. Attach your logo or references there.
      </p>
    </form>
  );
}
