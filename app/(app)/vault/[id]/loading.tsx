export default function DocumentLoading() {
  return (
    <div className="flex flex-col pb-12 animate-pulse">
      <header className="px-6 pt-8 pb-5">
        <div className="h-4 w-24 bg-slate-200 rounded-full mb-5" />
        <div className="h-7 w-64 bg-slate-200 rounded-full mb-2" />
        <div className="h-4 w-40 bg-slate-200 rounded-full" />
      </header>
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-200 rounded-[20px]" />
          <div className="h-20 bg-slate-200 rounded-[20px]" />
        </div>
        <div className="h-12 bg-slate-200 rounded-[16px]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}
