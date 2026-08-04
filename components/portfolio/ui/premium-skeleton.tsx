"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function PremiumSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-r from-background-subtle via-background-elevated to-background-subtle bg-[length:400%_100%] animate-shimmer",
        className
      )}
    />
  );
}

export function SkeletonPage() {
  return (
    <div
      className="min-h-screen bg-background"
      aria-label="Loading portfolio"
      role="status"
    >
      {/* Nav skeleton */}
      <div className="container-narrow pt-6">
        <PremiumSkeleton className="h-14 rounded-full" />
      </div>

      {/* Hero skeleton */}
      <div className="container-narrow mt-16 flex flex-col items-center gap-6">
        <PremiumSkeleton className="w-32 h-5 rounded-full" />
        <PremiumSkeleton className="w-3/4 max-w-2xl h-24 md:h-32" />
        <PremiumSkeleton className="w-2/3 max-w-lg h-5" />
        <PremiumSkeleton className="w-40 h-12 rounded-full mt-4" />
      </div>

      {/* Section skeleton */}
      <div className="container-narrow mt-24 grid gap-6">
        <PremiumSkeleton className="h-80 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumSkeleton className="h-64 rounded-3xl" />
          <PremiumSkeleton className="h-64 rounded-3xl" />
        </div>
      </div>

      <span className="sr-only">Loading live portfolio data</span>
    </div>
  );
}
