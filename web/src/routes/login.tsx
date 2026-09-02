import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Creator",
          callbackURL: "/discover",
        });
        if (res.error) throw new Error(res.error.message || "Could not create account");
      } else {
        const res = await authClient.signIn.email({ email, password, callbackURL: "/discover" });
        if (res.error) throw new Error(res.error.message || "Could not sign in");
      }
      window.location.assign("/discover");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <img src="/media/crowd-wide.jpg" alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/85 to-bg" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-8">
          <Logo />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "in" ? "Welcome back" : "Claim your stage"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "in"
            ? "Log in to go live, follow creators, and send gifts."
            : "Create an account — no gatekeepers, no waitlist."}
        </p>
        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/discover" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-subtle">
          <span className="h-px flex-1 bg-border" />
          or email
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={onEmail} className="space-y-3">
          {mode === "up" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="DJ Nightwave" autoComplete="name" />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@novelmixes.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
          </div>
          <Button type="submit" className="mt-2 w-full" disabled={busy || !authEnabled}>
            {busy ? "Please wait…" : mode === "in" ? "Log in" : "Create account"}
          </Button>
        </form>
        <button type="button" className="mt-6 text-sm text-muted hover:text-fg" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}
