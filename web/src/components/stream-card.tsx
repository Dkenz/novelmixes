import { Link } from "@tanstack/react-router";
import { LiveBadge } from "@/components/ui/badge";
import { formatCompactTime, formatViewers } from "@/lib/utils";
import type { Stream } from "@/lib/types";

export function StreamCard({ stream, featured = false }: { stream: Stream; featured?: boolean }) {
  return (
    <Link to="/watch/$streamId" params={{ streamId: stream.id }} className="group block min-w-0">
      <article className="flex flex-col gap-2.5">
        <div className={featured ? "relative aspect-[16/10] overflow-hidden rounded-2xl" : "relative aspect-video overflow-hidden rounded-xl"}>
          <img
            src={stream.thumbnail}
            alt=""
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
          <div className="absolute left-2.5 top-2.5">{stream.status === "live" ? <LiveBadge /> : null}</div>
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
            <p className="truncate text-sm font-medium text-fg">{stream.title}</p>
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-fg/80">
              {formatViewers(stream.viewerCount)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-0.5">
          <img src={stream.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-fg">{stream.displayName}</p>
            <p className="truncate text-xs text-muted">
              {stream.category} · {formatCompactTime(stream.startedAt)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function StreamRow({ stream }: { stream: Stream }) {
  return (
    <Link
      to="/watch/$streamId"
      params={{ streamId: stream.id }}
      className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-fg/5"
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
        <img src={stream.avatar} alt="" className="size-full object-cover" />
        {stream.status === "live" ? (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-live ring-2 ring-bg" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{stream.displayName}</p>
        <p className="truncate text-xs text-muted">{stream.title}</p>
      </div>
      <span className="text-xs tabular-nums text-muted">{formatViewers(stream.viewerCount)}</span>
    </Link>
  );
}
