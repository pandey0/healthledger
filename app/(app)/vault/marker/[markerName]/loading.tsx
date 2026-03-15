export default function MarkerLoading() {
  return (
    <div className="flex flex-col pb-12 animate-pulse">
      <header className="px-6 pt-8 pb-5">
        <div className="h-4 w-24 bg-slate-200 rounded-full mb-5" />
        <div className="h-7 w-40 bg-slate-200 rounded-full mb-2" />
        <div className="h-3 w-28 bg-slate-200 rounded-full" />
      </header>
      <div className="px-6 space-y-4">
        <div className="h-28 bg-slate-200 rounded-[24px]" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-slate-200 rounded-[18px]" />
          <div className="h-20 bg-slate-200 rounded-[18px]" />
          <div className="h-20 bg-slate-200 rounded-[18px]" />
        </div>
        <div className="h-16 bg-slate-200 rounded-[20px]" />
        <div className="h-72 bg-slate-200 rounded-[20px]" />
      </div>
    </div>
  );
}
