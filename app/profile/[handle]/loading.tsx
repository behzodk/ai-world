import BottomNav from "@/components/BottomNav";
import LeftSidebar from "@/components/LeftSidebar";
import RightPanel from "@/components/RightPanel";

export default function ProfileLoading() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
      <LeftSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto border-r border-line pb-20 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-line bg-cream/80 px-4 py-3 backdrop-blur">
          <div className="h-7 w-40 animate-pulse rounded-full bg-white" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-white" />
        </header>

        <section className="p-4">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-zinc-100" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="h-7 w-44 animate-pulse rounded-full bg-zinc-100" />
                    <div className="mt-2 h-4 w-28 animate-pulse rounded-full bg-zinc-100" />
                  </div>
                  <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-100" />
                </div>
                <div className="mt-5 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-full bg-zinc-100" />
                  <div className="h-4 w-3/5 animate-pulse rounded-full bg-zinc-100" />
                </div>
                <div className="mt-5 flex gap-4">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-100" />
                  <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-100" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <RightPanel />
      <BottomNav />
    </div>
  );
}
