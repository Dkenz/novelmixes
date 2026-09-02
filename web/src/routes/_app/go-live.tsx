import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureProfile, startBroadcast } from "@/lib/api";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { broadcast } from "@/lib/broadcast";
import { CATEGORIES, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/go-live")({
  component: GoLivePage,
});

function GoLivePage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("music");
  const [tags, setTags] = useState("");
  const [audience, setAudience] = useState<"everyone" | "followers">("everyone");
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        broadcast.set(media);
        setCamReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setCamError("Camera unavailable — you can still go live with a stage visual.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const go = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      await ensureProfile({
        data: { displayName: user.displayName ?? user.primaryEmail ?? "Creator" },
      });
      return startBroadcast({
        data: {
          title: title.trim() || "Untitled set",
          category,
          tags,
          audience,
        },
      });
    },
    onSuccess: (stream) => {
      toast.success("You are live");
      void navigate({ to: "/watch/$streamId", params: { streamId: stream.id } });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not go live"),
  });

  if (isPending) return <div className="nm-skeleton m-6 h-96 rounded-2xl" />;
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/discover" className="grid size-10 place-items-center rounded-full hover:bg-fg/10" aria-label="Back">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold">Go Live</h1>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-elevated">
        {camReady ? (
          <video ref={videoRef} className="size-full object-cover" playsInline muted autoPlay />
        ) : (
          <img src="/media/crowd-wide.jpg" alt="" className="size-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
        <p className="absolute bottom-3 left-4 text-sm text-muted">
          {camError ?? (camReady ? "Camera preview" : "Requesting camera…")}
        </p>
      </div>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          go.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Electric Pulse" maxLength={80} required />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "h-9 rounded-full px-4 text-sm capitalize",
                  category === c ? "nm-gradient text-fg" : "bg-surface text-muted",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Audience</Label>
          <div className="flex gap-2">
            {(["everyone", "followers"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                className={cn(
                  "h-9 flex-1 rounded-full text-sm capitalize",
                  audience === a ? "nm-gradient text-fg" : "bg-surface text-muted",
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="electronic, live set" maxLength={80} />
        </div>
        <Button type="submit" className="mt-2 w-full" size="lg" disabled={go.isPending}>
          {go.isPending ? "Going live…" : "Go Live Now"}
        </Button>
      </form>
    </div>
  );
}
