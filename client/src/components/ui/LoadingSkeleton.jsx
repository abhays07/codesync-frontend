export default function LoadingSkeleton({ cards = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-[#535C91] bg-[#1B1A55]/70 p-5"
        >
          <div className="mb-4 h-4 w-1/3 rounded bg-[#535C91]/40" />
          <div className="mb-3 h-6 w-2/3 rounded bg-[#535C91]/50" />
          <div className="mb-2 h-3 w-full rounded bg-[#535C91]/35" />
          <div className="mb-2 h-3 w-4/5 rounded bg-[#535C91]/35" />
          <div className="mt-6 h-8 w-28 rounded-md bg-[#9290C3]/40" />
        </div>
      ))}
    </div>
  );
}
