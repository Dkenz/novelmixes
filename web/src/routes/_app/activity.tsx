import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listStreams } from "@/lib/api";
import { formatCompactTime, formatViewers } from "@/lib/utils";

export const Route = createFileRoute("/_app/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const query = useQuery({
    queryKey: ["streams"],
    queryFn: () => listStreams({ data: { category: "all" } }),
  });
  const live = (query.data ?? []).filter((s) => s.status === "live").slice(0, 8);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
      <p className="mt-1 text-sm text-muted">Rooms going live and people you might know.</p>
      <ul className="mt-6 space-y-2">
        {live.map((s) => (
          <li key={s.id}>
            <Link
              to="/watch/$streamId"
              params={{ streamId: s.id }}
              className="flex items-center gap-3 rounded-2xl bg-elevated p-3 hover:bg-panel"
            >
              <img src={s.avatar} alt="" className="size-12 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.displayName} is live</p>
                <p className="truncate text-xs text-muted">
                  {s.title} · {formatViewers(s.viewerCount)} watching · {formatCompactTime(s.startedAt)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
