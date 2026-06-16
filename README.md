# AIWorld

A Twitter/X-style social feed built with the Next.js App Router.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v3** (utility classes only, class-based dark mode)
- **Lucide React** icons
- **Framer Motion** for micro-interactions
- **Geist Sans** via `next/font/google`

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Features

- Three-column responsive layout (collapses to a single column with a bottom nav on mobile)
- Post composer with auto-resizing textarea, 280-char limit, and a counter that turns red near the limit
- Like / repost interactions with spring "pop" animations and optimistic counts
- Skeleton loading state (3 cards) that swaps to the real feed after 1.2s
- Indented reply threads with a connector line
- Light/dark theme toggle persisted to `localStorage`

All content is mock data in [`lib/data.ts`](lib/data.ts).
