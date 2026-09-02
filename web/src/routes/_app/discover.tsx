import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { StreamCard, StreamRow } from "@/components/stream-card";
import { LiveBadge } from "@/components/ui/badge";
import { listStreams } from "@/lib/api";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { id: "live" | Category | "trending"; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "music", label: "Music" },
  { id: "gaming", label: "Gaming" },
  { id: "talk", label: "Talk" },
  { id: "trending", label: "Trending" },
];

type Search = { q?: string; tab?: string };

export const Route = createFileRoute("/_app/discover")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    tab: typeof s.tab === "string" ? s.tab : undefined,
  }),
  component: Discover,
});

function Discover() {
  const { q, tab } = Route.useSearch();
  const active = (tab as (typeof TABS)[number]["id"] | undefined) ?? "live";
  const query = useQuery({
    queryKey: ["streams"],
    queryFn: () => listStreams({ data: { category: "all" } }),
    retry: 3,
  });
  const streams = query.data ?? [];
  const needle = (q ?? "").trim().toLowerCase();
  const filtered = streams.filter((s) => {
    if (needle) {
      const hay = `${s.title} ${s.displayName} ${s.handle} ${s.tags} ${s.category}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (active === "live") return s.status === "live";
    if (active === "trending") return true;
    return s.category === active;
  });
  const featured = filtered.find((s) => s.isFeatured) ?? filtered[0];
  const rest = filtered.filter((s) => s.id !== featured?.id);
  const recommended = (featured ? [featured, ...rest] : rest).slice(0, 8);
  const top = [...streams].sort((a, b) => b.viewerCount - a.viewerCount).slice(0, 6);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
      <div className="min-w-0">
        <section className="relative hidden overflow-hidden rounded-3xl lg:block">
          <img src="/media/crowd-wide.jpg" alt="" className="h-56 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted">Novel Mixes</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Go Live. Connect. Earn.</h1>
            <Link
              to="/go-live"
              className="nm-gradient mt-5 inline-flex h-11 w-fit items-center rounded-full px-5 text-sm font-semibold"
            >
              Go Live Now
            </Link>
          </div>
        </section>
        <div className="mt-1 flex items-center justify-between lg:mt-8">
          <h2 className="text-xl font-semibold tracking-tight">Live Now</h2>
          <LiveBadge />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <Link
              key={t.id}
              to="/discover"
              search={{ tab: t.id, q }}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-sm font-medium",
                active === t.id ? "nm-gradient text-fg" : "bg-surface text-muted hover:text-fg",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
        {query.isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="nm-skeleton aspect-video rounded-xl" />
            ))}
          </div>
        ) : query.isError ? (
          <p className="mt-10 text-sm text-muted">Couldn’t load live rooms. Refresh to try again.</p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted">No live rooms in this lane yet. Try another tab.</p>
        ) : (
          <>
            {featured ? (
              <div className="mt-6">
                <StreamCard stream={featured} featured />
              </div>
            ) : null}
            <h3 className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-muted">Recommended for you</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {recommended.map((s) => (
                <StreamCard key={s.id} stream={s} />
              ))}
            </div>
          </>
        )}
      </div>
      <aside className="hidden lg:block">
        <div className="rounded-2xl border border-border bg-elevated p-4">
          <h3 className="text-sm font-semibold">Top streamers</h3>
          <div className="mt-3 space-y-1">
            {top.map((s) => (
              <StreamRow key={s.id} stream={s} />
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-elevated p-4">
          <h3 className="text-sm font-semibold">Trending now</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {["#ElectricPulse", "#WarehouseNights", "#RankedGrind", "#OpenMic"].map((tag) => (
              <li key={tag} className="rounded-lg bg-fg/5 px-3 py-2 text-fg">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
