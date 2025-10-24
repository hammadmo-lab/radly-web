import * as React from "react";

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="relative w-full h-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,rgba(255,255,255,0.12)0%,transparent 45%,rgba(255,255,255,0.12)90%)]" />
      <div
        className="relative h-full rounded-full bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_45%,#8F82FF_100%)] shadow-[0_0_18px_rgba(75,142,255,0.55)] transition-all duration-500"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
