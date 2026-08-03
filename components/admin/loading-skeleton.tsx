"use client";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={`admin-skeleton ${className}`}
      style={{ width, height, minHeight: height || 16 }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="admin-stat-card">
      <Skeleton width={40} height={40} className="mb-4 rounded-xl" />
      <Skeleton width={80} height={28} className="mb-2" />
      <Skeleton width={120} height={14} />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton height={14} width={i === 0 ? "60%" : i === columns - 1 ? 80 : "80%"} />
        </td>
      ))}
    </tr>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-card">
          <Skeleton height={160} className="rounded-t-[16px]" />
          <div className="p-4">
            <Skeleton width="70%" height={16} className="mb-2" />
            <Skeleton width="90%" height={12} className="mb-1" />
            <Skeleton width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
