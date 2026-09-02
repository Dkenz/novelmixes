import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StreamCard } from "@/components/stream-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureProfile, getMyProfile, listMyStreams, updateMyProfile } from "@/lib/api";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    void ensureProfile({
      data: { displayName: user.displayName ?? user.primaryEmail ?? "Creator" },
    }).then(() => qc.invalidateQueries({ queryKey: ["me"] }));
  }, [user, qc]);

  const meQ = useQuery({
    queryKey: ["me"],
    queryFn: () => getMyProfile(),
    enabled: Boolean(user),
    retry: false,
  });
  const streamsQ = useQuery({
    queryKey: ["my-streams"],
    queryFn: () => listMyStreams(),
    enabled: Boolean(user),
    retry: false,
  });

  useEffect(() => {
    if (meQ.data) {
      setName(meQ.data.displayName);
      setBio(meQ.data.bio);
    }
  }, [meQ.data]);

  const save = useMutation({
    mutationFn: () => updateMyProfile({ data: { displayName: name, bio } }),
    onSuccess: () => {
      toast.success("Profile saved");
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  if (isPending) return <div className="nm-skeleton m-6 h-64 rounded-2xl" />;
  if (!user) return <RedirectToSignIn />;

  const streams = streamsQ.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-4">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="size-20 rounded-full object-cover" />
        ) : (
          <span className="grid size-20 place-items-center rounded-full bg-panel text-2xl font-semibold">
            {(user.displayName ?? "C").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold">{meQ.data?.displayName ?? user.displayName}</h1>
          <p className="text-sm text-muted">@{meQ.data?.handle ?? "creator"}</p>
        </div>
      </div>

      <div className="mt-4">
        <UserButton />
      </div>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="display">Display name</Label>
          <Input id="display" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={180} />
        </div>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </form>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">Your streams</h2>
        <Link to="/go-live" className="text-sm font-medium text-accent">
          Go live
        </Link>
      </div>
      {streams.length === 0 ? (
        <p className="mt-4 text-sm text-muted">You have not gone live yet. Your stage is ready.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {streams.map((s) => (
            <StreamCard key={s.id} stream={s} />
          ))}
        </div>
      )}
    </div>
  );
}
