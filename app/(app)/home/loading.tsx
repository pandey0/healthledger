export default function HomeLoading() {
  return (
    <div className="flex flex-col pb-28 md:pb-12 animate-pulse">
      <header className="px-6 pt-10 pb-6">
        <div className="h-3 w-32 bg-slate-200 rounded-full mb-3" />
        <div className="h-8 w-56 bg-slate-200 rounded-full" />
      </header>
      <main className="px-6 space-y-6">
        <div className="h-36 bg-slate-200 rounded-[28px]" />
        <div className="h-24 bg-slate-200 rounded-[24px]" />
        <div className="h-20 bg-slate-200 rounded-[24px]" />
      </main>
    </div>
  );
}
