"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Loader } from "@/components/ui";
import { saveSession } from "./session";
import "./login.css";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export type Role = "admin" | "employee";

interface RoleConfig {
  label: string;
  blurb: string;
  userLabel: string;
  userType: "email" | "text";
}

const ROLES: Record<Role, RoleConfig> = {
  admin: {
    label: "Admin",
    blurb: "Orders, catalogue, crew",
    userLabel: "Admin email",
    userType: "email",
  },
  employee: {
    label: "Employee",
    blurb: "Jobs, stages, pickups",
    userLabel: "Username",
    userType: "text",
  },
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const noop = () => () => {};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const Icon = {
  shield: (
    <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  crew: (
    <path
      d="M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5M16 4.3a3.5 3.5 0 010 6.4M18 13.8c2.1.8 3.5 3 3.5 5.7"
      strokeLinecap="round"
    />
  ),
  user: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />,
  mail: <path d="M3 6h18v12H3zM3 7l9 6 9-6" strokeLinejoin="round" />,
  lock: <path d="M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 017 0v3M12 15v2" strokeLinecap="round" strokeLinejoin="round" />,
  eye: <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z" />,
  eyeOff: <path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.1 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 004.2 4.2" strokeLinecap="round" />,
};

const Svg = ({ children, className = "h-5 w-5" }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden="true">
    {children}
  </svg>
);

/* ------------------------------------------------------------------ */
/* Field                                                               */
/* ------------------------------------------------------------------ */

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
}

function Field({ label, icon, trailing, inputRef, id, ...input }: FieldProps) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink/40 transition-colors group-focus-within:text-accent">
        <Svg>{icon}</Svg>
      </span>
      <input
        id={id}
        ref={inputRef}
        placeholder=" "
        {...input}
        className="peer h-14 w-full rounded-2xl border border-ink/12 bg-white pt-5 pr-14 pl-12 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-300 focus:border-accent focus:shadow-[0_0_0_4px_rgba(189,85,1,0.12)]"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-12 -translate-y-[130%] text-[11px] font-semibold tracking-wide text-ink/50 uppercase transition-all duration-200 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:-translate-y-[130%] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:tracking-wide peer-focus:text-accent peer-focus:uppercase"
      >
        {label}
      </label>
      {trailing}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

interface Props {
  open: boolean;
  onClose: () => void;
  initialRole?: Role;
}

export default function LoginModal({ open, onClose, initialRole = "employee" }: Props) {
  const [role, setRole] = useState<Role>(initialRole);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  // true on the client only, so the portal never renders during SSR
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const firstField = useRef<HTMLInputElement>(null);
  const uid = useId();
  const router = useRouter();
  const pathname = usePathname();
  const cfg = ROLES[role];

  // Lock page scroll, close on Escape, focus the first field.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstField.current?.focus(), 150);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  // Reset everything shortly after the card closes.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStatus("idle");
      setShowPass(false);
      setUser("");
      setPass("");
    }, 400);
    return () => clearTimeout(t);
  }, [open]);

  // Keep the loader up until the dashboard route has rendered, then close the card.
  useEffect(() => {
    if (status === "loading" && pathname === "/dashboard") onClose();
  }, [status, pathname, onClose]);

  const pickRole = (r: Role) => {
    if (r === role) return;
    setRole(r);
    setUser("");
    setStatus("idle");
    setTimeout(() => firstField.current?.focus(), 0);
  };

  // UI only — no backend yet. Saves a demo session and navigates; the loader stays until the route changes.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    saveSession({ user: user.trim(), role });
    router.push("/dashboard");
  };

  const onPassKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsOn(e.getModifierState("CapsLock"));

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 transition-[visibility] duration-500 sm:p-6 ${
        open ? "visible" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close login"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/70 backdrop-blur-md transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className={`relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[480px] overflow-y-auto rounded-[32px] bg-cream shadow-[0_50px_100px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition-[transform,opacity] duration-700 ${EASE} ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-[0.96] opacity-0"
        }`}
      >
        <section className="relative flex flex-col p-6 sm:p-9">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 grid h-11 w-11 cursor-pointer place-items-center rounded-full text-ink/60 transition-[background-color,color,transform] duration-300 hover:rotate-90 hover:bg-ink hover:text-cream"
          >
            <Svg>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </Svg>
          </button>

          <p className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">Team sign-in</p>
          <h2 id={`${uid}-title`} className="mt-2 text-[34px] leading-none font-extrabold tracking-[-0.04em] text-ink">
            Welcome back<span className="text-accent">.</span>
          </h2>
          <p className="mt-2 text-sm text-ink/60">Choose who you are, then sign in.</p>

            <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
              {/* Role tiles */}
              <div role="radiogroup" aria-label="Sign in as" className={`grid grid-cols-2 gap-3 login-rise`}>
                {(Object.keys(ROLES) as Role[]).map((r) => {
                  const on = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => pickRole(r)}
                      className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-300 active:scale-[0.98] ${
                        on
                          ? "border-ink bg-ink text-cream shadow-[0_18px_30px_-18px_rgba(0,20,8,0.9)]"
                          : "border-ink/12 bg-white text-ink hover:-translate-y-0.5 hover:border-ink/30"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-xl transition-colors duration-300 ${
                          on ? "bg-accent text-white" : "bg-ink/[0.06] text-ink group-hover:text-accent"
                        }`}
                      >
                        <Svg>{r === "admin" ? Icon.shield : Icon.crew}</Svg>
                      </span>
                      <span className="mt-3 block text-[15px] font-bold">{ROLES[r].label}</span>
                      <span className={`block text-xs ${on ? "text-cream/60" : "text-ink/50"}`}>{ROLES[r].blurb}</span>
                      <span
                        aria-hidden="true"
                        className={`absolute top-4 right-4 grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${
                          on ? "border-accent bg-accent" : "border-ink/20"
                        }`}
                      >
                        {on && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={`mt-2 login-rise`} style={{ animationDelay: "80ms" }}>
                <Field
                  key={role}
                  id={`${uid}-user`}
                  inputRef={firstField}
                  label={cfg.userLabel}
                  icon={role === "admin" ? Icon.mail : Icon.user}
                  type={cfg.userType}
                  required
                  autoComplete={role === "admin" ? "email" : "username"}
                  autoCapitalize="none"
                  spellCheck={false}
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>

              <div className="login-rise" style={{ animationDelay: "140ms" }}>
                <Field
                  id={`${uid}-pass`}
                  label="Password"
                  icon={Icon.lock}
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onKeyUp={onPassKey}
                  onKeyDown={onPassKey}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-xl text-ink/45 transition-colors hover:bg-ink/5 hover:text-accent"
                    >
                      <Svg>{showPass ? Icon.eyeOff : Icon.eye}</Svg>
                    </button>
                  }
                />
                {capsOn && <p className="mt-1.5 pl-1 text-xs font-medium text-accent">Caps Lock is on</p>}
              </div>

              <div className={`flex items-center justify-between text-sm login-rise`} style={{ animationDelay: "200ms" }}>
                <label className="flex cursor-pointer items-center gap-2.5 py-2 text-ink/70 select-none">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="grid h-5 w-5 place-items-center rounded-md border-2 border-ink/20 text-transparent transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-accent/20">
                    <Svg className="h-3.5 w-3.5">
                      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                    </Svg>
                  </span>
                  Keep me signed in
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`group relative mt-2 flex h-14 cursor-pointer items-center justify-between overflow-hidden rounded-full bg-ink pr-2 pl-7 text-[15px] font-semibold text-white disabled:cursor-wait login-rise`}
                style={{ animationDelay: "260ms" }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ${EASE} group-hover:translate-y-0`}
                />
                <span className="relative">{status === "loading" ? "Signing in…" : `Sign in as ${cfg.label}`}</span>
                <span
                  aria-hidden="true"
                  className={`relative grid h-10 w-10 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}
                >
                  {status === "loading" ? (
                    <Loader size="sm" />
                  ) : (
                    "→"
                  )}
                </span>
              </button>
            </form>
        </section>

        {/* Loader — covers the card until the dashboard has opened */}
        <Loader overlay show={status === "loading"} label="Opening your dashboard…" />
      </div>
    </div>,
    document.body,
  );
}
