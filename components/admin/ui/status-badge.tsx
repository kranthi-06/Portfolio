"use client";

interface StatusBadgeProps {
  status: "draft" | "published" | "archived";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const classMap = {
    draft: "admin-badge admin-badge-draft",
    published: "admin-badge admin-badge-published",
    archived: "admin-badge admin-badge-archived",
  };

  const dotColor = {
    draft: "var(--admin-warning)",
    published: "var(--admin-success)",
    archived: "var(--admin-ink-muted)",
  };

  return (
    <span className={classMap[status]}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dotColor[status],
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}
