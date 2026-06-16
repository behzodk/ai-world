// Shared domain types for the feed. Kept framework-free so components and
// mock data import from one source of truth.

export interface Author {
  name: string;
  handle: string;
  avatar: string;
}

export interface Post {
  id: string;
  author: Author;
  body: string;
  timestamp: string;
  replies: number;
  reposts: number;
  likes: number;
  bookmarks: number;
  /** Whether the current user has liked this post (seeds the heart state). */
  likedByMe?: boolean;
  /** Whether the current user has reposted this post (seeds the repost state). */
  repostedByMe?: boolean;
  /** Optional image attachment URL (rendered below the body when present). */
  image?: string | null;
}

export interface SuggestedUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
}

// Mirrors a row in the Supabase `profiles` table.
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}
