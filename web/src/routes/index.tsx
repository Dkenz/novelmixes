import { createFileRoute, Link } from "@tanstack/react-router";
import { Radio, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <img
        src="/media/crowd-hero.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-80 sm:hidden"
      />
      <img
        src="/media/crowd-wide.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 hidden size-full object-cover opacity-70 sm:block"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/45 to-bg" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Logo size="md" />
          <Link
            to="/login"
            className="hidden h-10 items-center rounded-full border border-border px-4 text-sm font-medium hover:bg-fg/5 sm:inline-flex"
          >
            Log in
          </Link>
        </header>

        <div className="mt-auto grid flex-1 items-end gap-10 pb-10 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted">Open live streaming</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Go Live.
              <br />
              Connect.
              <br />
              Earn.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              The first open live platform built for creators, music, gaming, talk, and real connection.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/discover"
                className="nm-gradient inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold text-fg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-sm font-medium hover:bg-fg/5"
              >
                Log In
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-3 gap-3 text-center sm:text-left">
              <Pill icon={Radio} label="Live daily" />
              <Pill icon={Sparkles} label="Open platform" />
              <Pill icon={Users} label="Creator first" />
            </ul>
          </div>
          <div className="hidden overflow-hidden rounded-[2rem] border border-border shadow-glow lg:block">
            <img src="/media/nightwave-portrait.jpg" alt="" className="aspect-[3/4] w-full object-cover" />
          </div>
        </div>
      </div>

      <section className="relative border-t border-border bg-bg">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted">Creator first</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Creators deserve more.</h2>
            <p className="mt-4 max-w-md text-muted">
              No gatekeepers. No limits. Just opportunity — your stage, your people, your moment.
            </p>
            <Link
              to="/go-live"
              className="nm-gradient mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold"
            >
              Go Live Now
            </Link>
          </div>
          <img src="/media/creators-banner.jpg" alt="" className="aspect-video w-full rounded-2xl object-cover" />
        </div>
      </section>
    </main>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Radio; label: string }) {
  return (
    <li className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
      <span className="grid size-9 place-items-center rounded-full bg-fg/10">
        <Icon className="size-4 text-accent" />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
    </li>
  );
}
