import type { Post, SuggestedUser } from "@/lib/types";

// Avatars are deterministic per handle so they stay stable across reloads.
const avatar = (handle: string) =>
  `https://i.pravatar.cc/80?u=${encodeURIComponent(handle)}`;

export const posts: Post[] = [
  {
    id: "p1",
    author: { name: "Mira Chen", handle: "mirabuilds", avatar: avatar("mirabuilds") },
    body: "shipped a thing today and the dopamine hit different.\n\nturns out the secret to momentum is just lowering the bar for what counts as a win.",
    timestamp: "2m",
    replies: 12,
    reposts: 8,
    likes: 214,
    bookmarks: 19,
  },
  {
    id: "p2",
    author: { name: "Devon Park", handle: "devonp", avatar: avatar("devonp") },
    body: "hot take: most “design systems” are just a button component and a lot of optimism.",
    timestamp: "14m",
    replies: 47,
    reposts: 31,
    likes: 902,
    bookmarks: 64,
  },
  {
    id: "p3",
    author: { name: "Lena Ortiz", handle: "lenacodes", avatar: avatar("lenacodes") },
    body: "spent 3 hours debugging.\nthe bug was a missing await.\nit is always a missing await.",
    timestamp: "38m",
    replies: 88,
    reposts: 120,
    likes: 3400,
    bookmarks: 210,
  },
  {
    id: "p4",
    author: { name: "Theo Nakamura", handle: "theo", avatar: avatar("theo") },
    body: "reminder that you don’t need a 12-step morning routine. you need to drink water and stop doomscrolling before noon. (posted at 11:58am)",
    timestamp: "1h",
    replies: 23,
    reposts: 56,
    likes: 1280,
    bookmarks: 41,
  },
  {
    id: "p5",
    author: { name: "Priya Raman", handle: "priya.r", avatar: avatar("priya.r") },
    body: "the best engineers I know are not the ones who know everything.\n\nthey’re the ones who are genuinely comfortable saying “I don’t know, let’s find out.”",
    timestamp: "3h",
    replies: 64,
    reposts: 210,
    likes: 5100,
    bookmarks: 488,
  },
  {
    id: "p6",
    author: { name: "Marcus Lee", handle: "marcusux", avatar: avatar("marcusux") },
    body: "we A/B tested a 4px change for two weeks. it won by 0.3%. I have never felt more alive and more dead at the same time.",
    timestamp: "5h",
    replies: 19,
    reposts: 14,
    likes: 740,
    bookmarks: 9,
  },
  {
    id: "p7",
    author: { name: "Nadia Volkov", handle: "nadiawrites", avatar: avatar("nadiawrites") },
    body: "underrated productivity tip: close the 47 browser tabs. they are not “in progress.” they are a museum of your abandoned intentions.",
    timestamp: "8h",
    replies: 132,
    reposts: 401,
    likes: 8900,
    bookmarks: 1200,
  },
  {
    id: "p8",
    author: { name: "Sam Boateng", handle: "samb", avatar: avatar("samb") },
    body: "launched my side project to 0 users with great fanfare. the silence is deafening but the codebase is immaculate, so really we all win.",
    timestamp: "11h",
    replies: 41,
    reposts: 27,
    likes: 1630,
    bookmarks: 73,
  },
];

// Keyed by parent post id. Powers ReplyThread; values reuse the Post shape so
// the same PostCard layout can render them at reduced scale.
export const replyThreads: Record<string, Post[]> = {
  p3: [
    {
      id: "p3-r1",
      author: { name: "Devon Park", handle: "devonp", avatar: avatar("devonp") },
      body: "or a missing dependency in a useEffect array. the two horsemen.",
      timestamp: "30m",
      replies: 3,
      reposts: 1,
      likes: 96,
      bookmarks: 2,
    },
    {
      id: "p3-r2",
      author: { name: "Lena Ortiz", handle: "lenacodes", avatar: avatar("lenacodes") },
      body: "honestly considering tattooing “did you await it” on my wrist.",
      timestamp: "22m",
      replies: 1,
      reposts: 0,
      likes: 41,
      bookmarks: 0,
    },
  ],
  p5: [
    {
      id: "p5-r1",
      author: { name: "Theo Nakamura", handle: "theo", avatar: avatar("theo") },
      body: "this. curiosity scales, ego doesn’t.",
      timestamp: "2h",
      replies: 4,
      reposts: 12,
      likes: 320,
      bookmarks: 8,
    },
  ],
};

export const suggestedUsers: SuggestedUser[] = [
  {
    id: "u1",
    name: "Ava Sinclair",
    handle: "avadesigns",
    avatar: avatar("avadesigns"),
    bio: "Design eng. Pixels with opinions.",
  },
  {
    id: "u2",
    name: "Kai Mendez",
    handle: "kaibuilds",
    avatar: avatar("kaibuilds"),
    bio: "Shipping small things daily.",
  },
  {
    id: "u3",
    name: "Robin Shah",
    handle: "robinotes",
    avatar: avatar("robinotes"),
    bio: "Writing about systems & focus.",
  },
];

export const trending: {
  id: string;
  tag: string;
  postCount: number;
  trend: "up" | "flat";
}[] = [
  {
    id: "ai-agents",
    tag: "AIAgents",
    postCount: 12400,
    trend: "up",
  },
  {
    id: "design-systems",
    tag: "DesignSystems",
    postCount: 9800,
    trend: "up",
  },
  {
    id: "ship-small",
    tag: "ShipSmall",
    postCount: 7200,
    trend: "flat",
  },
  {
    id: "typescript",
    tag: "TypeScript",
    postCount: 6300,
    trend: "up",
  },
  {
    id: "product-craft",
    tag: "ProductCraft",
    postCount: 4100,
    trend: "flat",
  },
];
