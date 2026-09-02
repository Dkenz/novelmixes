import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Compass, Home, Radio, UserRound } from "lucide-react";
import { useState } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/discover" as const, label: "Home", icon: Home, key: "home" },
  { to: "/discover" as const, label: "Discover", icon: Compass, key: "discover" },
  { to: "/activity" as const, label: "Activity", icon: Bell, key: "activity" },
  { to: "/profile" as const, label: "Profile", icon: UserRound, key: "profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome = pathname.startsWith("/watch/") || pathname === "/go-live";
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-elevated/90 px-4 py-5 lg:flex">
        <Link to="/" className="mb-8 px-1">
          <Logo size="sm" />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              (item.key === "home" && pathname === "/discover") ||
              (item.key === "activity" && pathname === "/activity") ||
              (item.key === "profile" && pathname === "/profile");
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active ? "bg-fg/10 text-fg" : "text-muted hover:bg-fg/5 hover:text-fg",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/go-live"
          className="nm-gradient mt-4 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-fg"
        >
          <Radio className="size-4" />
          Go Live
        </Link>
      </aside>

      <div className={cn("lg:pl-56", hideChrome ? "" : "pb-20 lg:pb-0")}>
        {!hideChrome ? (
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-md lg:px-8">
            <Link to="/" className="lg:hidden">
              <span className="nm-wordmark text-xl font-bold tracking-tight">NM</span>
            </Link>
            <form
              className="ml-auto flex-1 lg:ml-0 lg:max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                void navigate({ to: "/discover", search: { q } });
              }}
            >
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search streamers, topics, tags"
                className="h-10 rounded-full bg-surface"
              />
            </form>
            <AuthSlot compact />
          </header>
        ) : null}
        <div className="min-h-[calc(100dvh-4rem)]">{children}</div>
      </div>

      {!hideChrome ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-elevated/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-md lg:hidden">
          <TabLink to="/discover" icon={Home} label="Home" active={pathname === "/discover"} />
          <TabLink to="/discover" icon={Compass} label="Discover" active={false} />
          <Link to="/go-live" className="flex flex-col items-center justify-center py-1.5" aria-label="Go Live">
            <span className="nm-gradient grid size-11 -translate-y-3 place-items-center rounded-full text-fg shadow-glow">
              <Radio className="size-5" />
            </span>
          </Link>
          <TabLink to="/activity" icon={Bell} label="Activity" active={pathname === "/activity"} />
          <TabLink to="/profile" icon={UserRound} label="Profile" active={pathname === "/profile"} />
        </nav>
      ) : null}
    </div>
  );
}

function TabLink({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: "/discover" | "/activity" | "/profile";
  icon: typeof Home;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
        active ? "text-fg" : "text-subtle",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
