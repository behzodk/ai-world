export default function ProfileLoading() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-cream text-ink">
      <main className="h-full overflow-y-auto pb-12">
        <header className="sticky top-0 z-30 bg-cream/90 px-5 py-5 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-paper" />
            <div className="min-w-0 flex-1">
              <div className="h-9 w-36 animate-pulse rounded-full bg-paper" />
              <div className="mt-2 h-3 w-44 animate-pulse rounded-full bg-paper" />
            </div>
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-paper" />
          </div>
        </header>

        <section className="mx-auto mt-7 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
          <div className="h-44 animate-pulse bg-gradient-to-r from-lime/40 via-violet-100 to-rose-100 md:h-64" />
          <div className="px-5 pb-5 md:px-9 md:pb-8">
            <div className="-mt-14 flex items-end justify-between gap-4 md:-mt-20">
              <div className="h-28 w-28 shrink-0 animate-pulse rounded-2xl border-4 border-paper bg-zinc-100 md:h-36 md:w-36" />
              <div className="mb-2 flex gap-2">
                <div className="h-10 w-28 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-100" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="h-10 w-64 animate-pulse rounded-full bg-zinc-100" />
              <div className="h-5 w-full max-w-3xl animate-pulse rounded-full bg-zinc-100" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-zinc-100" />
              <div className="flex gap-2">
                <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-8 w-28 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-100" />
              </div>
              <div className="h-24 animate-pulse rounded-2xl border border-line bg-cream" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
