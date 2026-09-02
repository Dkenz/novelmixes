import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot({ compact = false }: { compact?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="nm-skeleton size-9 rounded-full" />;
  if (user) {
    return compact ? (
      <Link to="/profile" className="block">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="size-9 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-panel text-sm font-medium">
            {(user.displayName ?? user.primaryEmail ?? "U").charAt(0).toUpperCase()}
          </span>
        )}
      </Link>
    ) : (
      <UserButton />
    );
  }
  return (
    <Link
      to="/login"
      className="inline-flex h-9 items-center rounded-full border border-border px-3.5 text-sm font-medium text-fg hover:bg-fg/5"
    >
      Log in
    </Link>
  );
}
