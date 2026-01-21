export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ds-bg-gradient)] text-white">
      <div className="neon-shell relative mx-6 max-w-md rounded-3xl px-10 py-12 text-center backdrop-blur-xl">
        <div className="absolute inset-x-10 -top-24 h-48">
          <div className="hero-aurora" />
        </div>
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(245,215,145,0.45)] bg-[rgba(12,16,28,0.75)] shadow-[0_30px_80px_rgba(212,180,131,0.4)]">
          <span className="relative block h-14 w-14">
            <span className="absolute inset-0 rounded-full border-2 border-[rgba(75,142,255,0.28)]"></span>
            <span className="absolute inset-0 rounded-full border-2 border-[rgba(245,215,145,0.8)] border-t-transparent animate-spin"></span>
          </span>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.45)]">
            Preparing the assistant
          </p>
          <h1 className="text-2xl font-semibold sm:text-[2rem]">Generating your Radly experience</h1>
          <p className="text-sm text-[rgba(207,207,207,0.68)]">
            Fetching templates, refining gradients, and warming up the smart radiology assistant. This only takes a few
            seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
