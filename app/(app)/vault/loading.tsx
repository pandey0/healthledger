export default function VaultLoading() {
  return (
    <div className="flex flex-col pb-12 animate-pulse">
      <header className="px-6 pt-10 pb-5">
        <div className="h-8 w-44 bg-slate-200 rounded-full mb-2" />
        <div className="h-4 w-72 bg-slate-200 rounded-full" />
      </header>
      <div className="px-6 mb-4">
        <div className="h-11 bg-slate-200 rounded-[16px]" />
      </div>
      <div className="px-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-[20px]" />
        ))}
      </div>
    </div>
  );
}
