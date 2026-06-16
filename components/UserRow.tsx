import ProfileLink from "@/components/ProfileLink";
import FollowButton from "@/components/ui/FollowButton";

type UserRowProps = {
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio?: string | null;
  };
  initialIsFollowing: boolean;
};

export default function UserRow({ user, initialIsFollowing }: UserRowProps) {
  const name = user.display_name ?? user.username;
  const avatar =
    user.avatar_url ?? `https://i.pravatar.cc/80?u=${user.username}`;
  const profileHref = `/profile/${user.username}`;

  return (
    <li className="flex items-center gap-3 py-3">
      <ProfileLink
        href={profileHref}
        aria-label={`${name}'s profile`}
        indicator="overlay"
        className="h-10 w-10 shrink-0 rounded-full transition-opacity duration-150 hover:opacity-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
        <img
          src={avatar}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      </ProfileLink>
      <ProfileLink href={profileHref} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">{name}</p>
        <p className="truncate text-xs text-zinc-400">@{user.username}</p>
        {user.bio && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {user.bio}
          </p>
        )}
      </ProfileLink>
      <FollowButton
        targetUserId={user.id}
        initialIsFollowing={initialIsFollowing}
      />
    </li>
  );
}
