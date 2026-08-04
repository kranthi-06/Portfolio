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
        "rounded-2xl bg-gradient-to-r from-background-elevated via-background-subtle to-background-elevated bg-[length:400%_100%] animate-shimmer",
        className
      )} 
    />
  );
}

export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-background pt-6" aria-label="Loading portfolio" role="status">
      <PremiumSkeleton className="w-[min(1180px,calc(100%-40px))] h-12 mx-auto" />
      <main className="w-[min(1180px,calc(100%-40px))] mx-auto grid gap-10 pt-16">
        <PremiumSkeleton className="h-[min(570px,65vh)]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PremiumSkeleton className="h-64" />
          <PremiumSkeleton className="h-64" />
          <PremiumSkeleton className="h-64" />
        </div>
        <PremiumSkeleton className="h-80" />
      </main>
      <span className="sr-only">Loading live portfolio data</span>
    </div>
  );
}
