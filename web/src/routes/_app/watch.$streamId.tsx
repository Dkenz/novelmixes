import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { LiveChat } from "@/components/live-chat";
import { StagePlayer } from "@/components/stage-player";
import { StreamCard } from "@/components/stream-card";
import { Button } from "@/components/ui/button";
import {
  endBroadcast,
  getStream,
  listChat,
  listMyFollows,
  listStreams,
  postChat,
  sendGift,
  toggleFollow,
  toggleLike,
} from "@/lib/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { broadcast } from "@/lib/broadcast";
import { formatViewers } from "@/lib/utils";

export const Route = createFileRoute("/_app/watch/$streamId")({
  component: WatchPage,
});

function WatchPage() {
  const { streamId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isPending } = useCurrentUserState();

  const streamQ = useQuery({
    queryKey: ["stream", streamId],
    queryFn: () => getStream({ data: { id: streamId } }),
    retry: 3,
  });
  const chatQ = useQuery({
    queryKey: ["chat", streamId],
    queryFn: () => listChat({ data: { streamId } }),
    refetchInterval: 4000,
  });
  const catalogQ = useQuery({
    queryKey: ["streams"],
    queryFn: () => listStreams({ data: { category: "all" } }),
  });
  const followsQ = useQuery({
    queryKey: ["follows"],
    queryFn: () => listMyFollows(),
    enabled: Boolean(user),
    retry: false,
  });

  const stream = streamQ.data;
  const isBroadcaster = Boolean(user && stream?.ownerId === user.id);
  const following = followsQ.data?.includes(streamId) ?? false;
  const more = useMemo(
    () => (catalogQ.data ?? []).filter((s) => s.id !== streamId).slice(0, 4),
    [catalogQ.data, streamId],
  );

  const followMut = useMutation({
    mutationFn: () => toggleFollow({ data: { streamId } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["follows"] }),
    onError: () => toast.error("Sign in to follow"),
  });
  const likeMut = useMutation({
    mutationFn: () => toggleLike({ data: { streamId } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["stream", streamId] }),
    onError: () => toast.error("Sign in to like"),
  });
  const giftMut = useMutation({
    mutationFn: () => sendGift({ data: { streamId, amount: 5 } }),
    onSuccess: () => toast.success("Gift sent"),
    onError: () => toast.error("Sign in to send a gift"),
  });
  const endMut = useMutation({
    mutationFn: () => endBroadcast({ data: { streamId } }),
    onSuccess: () => {
      broadcast.set(null);
      toast.success("You are offline");
      void navigate({ to: "/discover" });
    },
  });

  if (streamQ.isLoading) return <div className="nm-skeleton m-4 h-[70vh] rounded-2xl" />;
  if (!stream) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-lg font-semibold">This room went dark.</p>
        <Link to="/discover" className="mt-4 inline-block text-sm text-accent">
          Back to live
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-6">
      <div>
        <div className="flex items-center gap-2 px-3 py-3 lg:px-0">
          <Link to="/discover" className="grid size-10 place-items-center rounded-full hover:bg-fg/10" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{stream.displayName}</p>
            <p className="truncate text-xs text-muted">@{stream.handle}</p>
          </div>
          {isBroadcaster ? (
            <Button variant="live" size="sm" onClick={() => endMut.mutate()} disabled={endMut.isPending}>
              End stream
            </Button>
          ) : (
            <Button
              variant={following ? "secondary" : "primary"}
              size="sm"
              onClick={() => {
                if (!user) {
                  void navigate({ to: "/login" });
                  return;
                }
                followMut.mutate();
              }}
            >
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </div>
        <StagePlayer
          stream={stream}
          isBroadcaster={isBroadcaster}
          liked={likeMut.data?.liked}
          onLike={() => {
            if (!user) {
              void navigate({ to: "/login" });
              return;
            }
            likeMut.mutate();
          }}
          onGift={() => {
            if (!user) {
              void navigate({ to: "/login" });
              return;
            }
            giftMut.mutate();
          }}
        />
        <div className="flex items-center gap-3 px-4 py-4 lg:px-0">
          <img src={stream.avatar} alt="" className="size-12 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{stream.displayName}</p>
            <p className="text-sm text-muted">{stream.bio}</p>
          </div>
          <div className="text-right text-xs text-muted">
            <p className="tabular-nums text-fg">{formatViewers(stream.followerCount)} followers</p>
            <p className="capitalize">{stream.category}</p>
          </div>
        </div>
        <div className="hidden px-0 pb-8 lg:block">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-muted">More live rooms</h3>
          <div className="grid grid-cols-2 gap-4">
            {more.map((s) => (
              <StreamCard key={s.id} stream={s} />
            ))}
          </div>
        </div>
      </div>
      <div className="h-[48vh] px-3 pb-4 lg:h-auto lg:min-h-[70vh] lg:px-0">
        <LiveChat
          messages={chatQ.data ?? []}
          canSend={Boolean(user) && !isPending}
          signedOutHint="Sign in to chat"
          onSend={async (body) => {
            await postChat({ data: { streamId, body } });
            await qc.invalidateQueries({ queryKey: ["chat", streamId] });
          }}
        />
      </div>
    </div>
  );
}
