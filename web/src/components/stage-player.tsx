import { Heart, Share2, Sparkles, Users } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LiveBadge } from "@/components/ui/badge";
import { broadcast } from "@/lib/broadcast";
import type { Stream } from "@/lib/types";
import { formatViewers } from "@/lib/utils";

function useLiveViewers(base: number) {
  const [n, setN] = useState(base);
  useEffect(() => {
    setN(base);
    const id = window.setInterval(() => {
      setN((v) => Math.max(12, v + Math.round((Math.random() - 0.4) * Math.max(6, base * 0.008))));
    }, 2600);
    return () => window.clearInterval(id);
  }, [base]);
  return n;
}

export function StagePlayer({
  stream,
  isBroadcaster,
  liked,
  onLike,
  onGift,
}: {
  stream: Stream;
  isBroadcaster?: boolean;
  liked?: boolean;
  onLike?: () => void;
  onGift?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cam = useSyncExternalStore(broadcast.subscribe, broadcast.get, () => null);
  const viewers = useLiveViewers(stream.viewerCount);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const src = isBroadcaster && cam ? "camera" : stream.video ? "file" : "image";

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (src === "camera" && cam) {
      el.srcObject = cam;
      el.play().catch(() => {});
      return () => {
        el.srcObject = null;
      };
    }
    if (src === "file") {
      el.srcObject = null;
      el.src = stream.video ?? "";
      el.play().catch(() => {});
    }
  }, [src, cam, stream.video]);

  function burst() {
    const id = Date.now() + Math.random();
    setHearts((h) => [...h.slice(-8), { id, x: 18 + Math.random() * 40 }]);
    window.setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 1400);
  }

  return (
    <div className="relative aspect-[9/16] overflow-hidden bg-elevated sm:aspect-video sm:rounded-2xl">
      {src === "image" ? (
        <img
          src={stream.portrait || stream.thumbnail}
          alt=""
          className="nm-kenburns absolute inset-0 size-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          playsInline
          muted={src !== "camera"}
          loop={src === "file"}
          autoPlay
        />
      )}
      <div className="nm-stage-overlay pointer-events-none absolute inset-0" />
      <div className="nm-eq pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end gap-1 px-5 pb-10">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="w-1 flex-1 rounded-full bg-accent/70"
            style={{ height: `${12 + ((i * 37) % 28)}px` }}
          />
        ))}
      </div>
      <div className="absolute left-4 top-4 flex items-center gap-2">
        {stream.status === "live" ? <LiveBadge /> : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-bg/55 px-2.5 py-1 text-xs font-medium text-fg backdrop-blur-sm">
          <Users className="size-3.5" />
          <span className="tabular-nums">{formatViewers(viewers)}</span>
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-16 sm:right-4">
        <p className="text-lg font-semibold leading-tight text-fg">{stream.title}</p>
        <p className="mt-0.5 text-sm text-muted">
          {stream.displayName} · {stream.category}
        </p>
      </div>
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 sm:bottom-4 sm:top-auto sm:translate-y-0 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            burst();
            onLike?.();
          }}
          className="flex size-11 items-center justify-center rounded-full bg-bg/50 text-fg backdrop-blur-sm hover:bg-bg/70"
          aria-label="Like"
        >
          <Heart className={`size-5 ${liked ? "fill-live text-live" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => {
            burst();
            onGift?.();
          }}
          className="flex size-11 items-center justify-center rounded-full bg-bg/50 text-fg backdrop-blur-sm hover:bg-bg/70"
          aria-label="Send a gift"
        >
          <Sparkles className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(window.location.href)}
          className="flex size-11 items-center justify-center rounded-full bg-bg/50 text-fg backdrop-blur-sm hover:bg-bg/70"
          aria-label="Share"
        >
          <Share2 className="size-5" />
        </button>
      </div>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="nm-heart pointer-events-none absolute bottom-20 right-6 text-live"
          style={{ ["--nm-drift" as string]: `${h.x - 30}px` }}
        >
          <Heart className="size-6 fill-live" />
        </span>
      ))}
    </div>
  );
}
